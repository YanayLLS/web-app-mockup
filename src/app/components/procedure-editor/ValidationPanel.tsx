import { Validation, Checkpoint, CheckpointType, CheckpointSeverity, MeasurementTolerance, MediaFile } from './ProcedureEditor';
import { X, Plus, Upload, Trash2, CheckCircle, XCircle, Camera, ChevronDown, ChevronUp, Eye, Ruler, CheckSquare, ListOrdered, Crosshair, ArrowRight, GripVertical, AlertTriangle, Info } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ValidationPanelProps {
  validation?: Validation;
  onAddValidation: () => void;
  onAddCheckpoint: () => void;
  onUpdateCheckpoint: (checkpointId: string, updates: Partial<Checkpoint>) => void;
  onRemoveCheckpoint: (checkpointId: string) => void;
  onReorderCheckpoints: (newOrder: Checkpoint[]) => void;
  onRemoveValidation: () => void;
  activeCheckpointId: string | null;
  onSetActiveCheckpointId: (id: string | null) => void;
  editingEnabled: boolean;
  onClose: () => void;
  onSelectParts: (callback: (parts: string[]) => void) => void;
  onSetArrowDirection: (callback: (direction: { x: number; y: number; z: number }) => void) => void;
  isMobileView: boolean;
  availableParts: string[];
}

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CHECKPOINTS = 10;

const SEVERITY_CONFIG: Record<CheckpointSeverity, { color: string; bg: string; label: string }> = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Warning' },
  info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Info' }
};

const TYPE_CONFIG: Record<CheckpointType, { icon: typeof Eye; label: string; desc: string }> = {
  visual: { icon: Eye, label: 'Visual', desc: 'Check visual condition of parts' },
  measurement: { icon: Ruler, label: 'Measurement', desc: 'Verify a measurement is within tolerance' },
  presence: { icon: CheckSquare, label: 'Presence', desc: 'Confirm a component is present' },
  sequence: { icon: ListOrdered, label: 'Sequence', desc: 'Verify steps done in correct order' }
};

const UNIT_OPTIONS = ['mm', 'psi', '°C', '°F', 'Nm', '%'];

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg pointer-events-none z-50"
            style={{
              backgroundColor: 'var(--popover)',
              color: 'var(--popover-foreground)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-normal)',
              boxShadow: 'var(--elevation-sm)',
              maxWidth: '240px',
              whiteSpace: 'normal',
              lineHeight: '1.5',
              border: '1px solid var(--border)'
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pass/Fail outcome editor for a single checkpoint
function OutcomeEditor({
  checkpoint,
  tab,
  editingEnabled,
  onUpdate
}: {
  checkpoint: Checkpoint;
  tab: 'pass' | 'fail';
  editingEnabled: boolean;
  onUpdate: (updates: Partial<Checkpoint>) => void;
}) {
  const stateKey = tab === 'pass' ? 'passState' : 'failState';
  const state = checkpoint[stateKey];
  const [localDesc, setLocalDesc] = useState(state.description);
  const [localRemediation, setLocalRemediation] = useState(state.remediationSteps || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDescBlur = () => {
    if (localDesc.trim() !== state.description) {
      onUpdate({
        [stateKey]: { ...state, description: localDesc.trim() }
      });
    }
  };

  const handleRemediationBlur = () => {
    if (localRemediation.trim() !== (state.remediationSteps || '')) {
      onUpdate({
        [stateKey]: { ...state, remediationSteps: localRemediation.trim() || undefined }
      });
    }
  };

  const handleMediaUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMedia: MediaFile = {
          id: crypto.randomUUID(),
          url: e.target?.result as string,
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : 'image',
          size: file.size
        };
        onUpdate({
          [stateKey]: { ...state, mediaFiles: [...state.mediaFiles, newMedia] }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteMedia = (mediaId: string) => {
    onUpdate({
      [stateKey]: { ...state, mediaFiles: state.mediaFiles.filter(m => m.id !== mediaId) }
    });
  };

  const placeholder = tab === 'pass'
    ? 'e.g., "All mounting bolts installed and properly tightened"'
    : 'e.g., "Missing bolts on the left side or bolts are loose"';

  return (
    <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
      {/* Description */}
      <div>
        <label style={{
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--foreground)',
          display: 'block',
          marginBottom: 'var(--spacing-xs)'
        }}>
          Description
        </label>
        {editingEnabled ? (
          <textarea
            value={localDesc}
            onChange={(e) => {
              if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) setLocalDesc(e.target.value);
            }}
            onBlur={handleDescBlur}
            placeholder={placeholder}
            className="w-full rounded-lg resize-none"
            style={{
              padding: 'var(--spacing-sm)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              outline: 'none',
              minHeight: '60px',
              lineHeight: '1.5'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.1)';
            }}
            onBlurCapture={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border)';
              (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
            }}
          />
        ) : (
          <p style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)',
            color: state.description ? 'var(--foreground)' : 'var(--muted-foreground)',
            margin: 0, padding: 'var(--spacing-sm)',
            backgroundColor: 'var(--card)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', minHeight: '40px', lineHeight: '1.5'
          }}>
            {state.description || 'No description'}
          </p>
        )}
      </div>

      {/* Remediation (fail tab only) */}
      {tab === 'fail' && (
        <div>
          <label style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-family)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            display: 'block',
            marginBottom: 'var(--spacing-xs)'
          }}>
            Remediation Steps
          </label>
          {editingEnabled ? (
            <textarea
              value={localRemediation}
              onChange={(e) => setLocalRemediation(e.target.value)}
              onBlur={handleRemediationBlur}
              placeholder="What should be done if this check fails?"
              className="w-full rounded-lg resize-none"
              style={{
                padding: 'var(--spacing-sm)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                outline: 'none',
                minHeight: '48px',
                lineHeight: '1.5'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.1)';
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border)';
                (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
              }}
            />
          ) : (
            <p style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
              color: state.remediationSteps ? 'var(--foreground)' : 'var(--muted-foreground)',
              margin: 0, padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--card)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', minHeight: '40px', lineHeight: '1.5'
            }}>
              {state.remediationSteps || 'No remediation steps'}
            </p>
          )}
        </div>
      )}

      {/* Media thumbnails */}
      {state.mediaFiles.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '6px' }}>
          {state.mediaFiles.map(media => (
            <div key={media.id} className="relative rounded overflow-hidden" style={{ width: '56px', height: '56px', border: '1px solid var(--border)' }}>
              {media.type === 'video' ? (
                <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={media.url} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {editingEnabled && (
                <button
                  onClick={() => handleDeleteMedia(media.id)}
                  className="absolute top-0 right-0 rounded-bl"
                  style={{ padding: '2px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: 'white', lineHeight: 0 }}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {editingEnabled && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleMediaUpload(e.target.files)}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--secondary)',
              color: 'var(--muted-foreground)',
              border: '1px dashed var(--border)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-medium)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
          >
            <Upload className="size-3" />
            Add Media
          </button>
        </>
      )}
    </div>
  );
}

// Checkpoint editor — expanded content
function CheckpointEditor({
  checkpoint,
  editingEnabled,
  onUpdate,
  onSelectParts,
  onSetArrowDirection,
  onClose: panelClose
}: {
  checkpoint: Checkpoint;
  editingEnabled: boolean;
  onUpdate: (updates: Partial<Checkpoint>) => void;
  onSelectParts: (callback: (parts: string[]) => void) => void;
  onSetArrowDirection: (callback: (direction: { x: number; y: number; z: number }) => void) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'pass' | 'fail'>('pass');
  const [localLabel, setLocalLabel] = useState(checkpoint.label);

  const handleLabelBlur = () => {
    if (localLabel.trim() !== checkpoint.label) {
      onUpdate({ label: localLabel.trim() });
    }
  };

  const handleSelectParts = () => {
    onSelectParts((parts: string[]) => {
      onUpdate({ selectedParts: parts });
    });
    panelClose();
  };

  const handleSetArrow = () => {
    onSetArrowDirection((direction) => {
      onUpdate({ arrowDirection: direction });
    });
  };

  const handleToleranceChange = (field: keyof MeasurementTolerance, value: string) => {
    const current = checkpoint.tolerance || { nominal: 0, min: 0, max: 0, unit: 'mm' };
    if (field === 'unit') {
      onUpdate({ tolerance: { ...current, unit: value } });
    } else {
      const num = parseFloat(value);
      if (!isNaN(num) || value === '' || value === '-') {
        onUpdate({ tolerance: { ...current, [field]: value === '' || value === '-' ? 0 : num } });
      }
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 0 0 0' }}>
      {/* Label input */}
      <div>
        <label style={{
          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-bold)', color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'block', marginBottom: 'var(--spacing-xs)'
        }}>
          Checkpoint Name
        </label>
        {editingEnabled ? (
          <input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onBlur={handleLabelBlur}
            placeholder='e.g., "Weld Integrity Check"'
            className="w-full rounded-lg"
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)',
              backgroundColor: 'var(--card)', color: 'var(--foreground)',
              border: '1px solid var(--border)', outline: 'none'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
            onBlurCapture={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
          />
        ) : (
          <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', color: 'var(--foreground)' }}>
            {checkpoint.label || 'Untitled checkpoint'}
          </span>
        )}
      </div>

      {/* Type selector */}
      <div>
        <label style={{
          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-bold)', color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'block', marginBottom: 'var(--spacing-xs)'
        }}>
          Type
        </label>
        <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--secondary)', padding: '3px', gap: '3px', border: '1px solid var(--border)' }}>
          {(Object.keys(TYPE_CONFIG) as CheckpointType[]).map(type => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const isActive = checkpoint.type === type;
            return (
              <button
                key={type}
                onClick={() => editingEnabled && onUpdate({ type })}
                disabled={!editingEnabled}
                className="flex-1 flex items-center justify-center rounded-md transition-all"
                style={{
                  gap: '4px', padding: '6px 4px',
                  backgroundColor: isActive ? 'var(--card)' : 'transparent',
                  color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                  border: 'none', cursor: editingEnabled ? 'pointer' : 'default',
                  fontSize: '11px', fontFamily: 'var(--font-family)',
                  fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
                title={cfg.desc}
              >
                <Icon className="size-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity selector */}
      <div>
        <label style={{
          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-bold)', color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'block', marginBottom: 'var(--spacing-xs)'
        }}>
          Severity
        </label>
        <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
          {(Object.keys(SEVERITY_CONFIG) as CheckpointSeverity[]).map(sev => {
            const cfg = SEVERITY_CONFIG[sev];
            const isActive = checkpoint.severity === sev;
            return (
              <button
                key={sev}
                onClick={() => editingEnabled && onUpdate({ severity: sev })}
                disabled={!editingEnabled}
                className="flex-1 flex items-center justify-center rounded-lg transition-all"
                style={{
                  gap: '6px', padding: '8px',
                  backgroundColor: isActive ? cfg.bg : 'var(--secondary)',
                  color: isActive ? cfg.color : 'var(--muted-foreground)',
                  border: isActive ? `1.5px solid ${cfg.color}` : '1.5px solid var(--border)',
                  cursor: editingEnabled ? 'pointer' : 'default',
                  fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
                  fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)'
                }}
              >
                <span className="rounded-full" style={{ width: '8px', height: '8px', backgroundColor: cfg.color, display: 'inline-block' }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Part selection */}
      <div>
        <label style={{
          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-bold)', color: 'var(--muted-foreground)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'block', marginBottom: 'var(--spacing-xs)'
        }}>
          Parts
        </label>
        <div
          className="rounded-lg flex items-center transition-all"
          style={{
            border: checkpoint.selectedParts.length > 0 ? '1.5px solid var(--primary)' : '1.5px dashed var(--border)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: checkpoint.selectedParts.length > 0 ? 'rgba(59,130,246,0.05)' : 'var(--secondary)',
            gap: 'var(--spacing-sm)',
            minHeight: '40px',
            cursor: editingEnabled ? 'pointer' : 'default',
            flexWrap: 'wrap'
          }}
          onClick={editingEnabled ? handleSelectParts : undefined}
        >
          {checkpoint.selectedParts.length > 0 ? (
            <>
              <Crosshair className="size-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              {checkpoint.selectedParts.map((part, i) => (
                <span key={i} className="rounded-full" style={{
                  fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-medium)', backgroundColor: 'rgba(59,130,246,0.1)',
                  color: 'var(--primary)', padding: '2px 8px'
                }}>
                  {part}
                </span>
              ))}
            </>
          ) : (
            <>
              <Crosshair className="size-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>
                {editingEnabled ? 'Click to select parts' : 'No parts selected'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow direction - compact */}
      <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
        <ArrowRight className="size-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
        {checkpoint.arrowDirection ? (
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)', color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
              ({checkpoint.arrowDirection.x.toFixed(1)}, {checkpoint.arrowDirection.y.toFixed(1)}, {checkpoint.arrowDirection.z.toFixed(1)})
            </span>
            {editingEnabled && (
              <>
                <button onClick={handleSetArrow} style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Change</button>
                <button onClick={() => onUpdate({ arrowDirection: undefined })} style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear</button>
              </>
            )}
          </div>
        ) : (
          editingEnabled ? (
            <button onClick={handleSetArrow} style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Set arrow direction
            </button>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>No direction set</span>
          )
        )}
      </div>

      {/* Measurement tolerance fields */}
      {checkpoint.type === 'measurement' && (
        <div>
          <label style={{
            fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
            fontWeight: 'var(--font-weight-bold)', color: 'var(--muted-foreground)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            display: 'block', marginBottom: 'var(--spacing-xs)'
          }}>
            Tolerance
          </label>
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            <div className="flex flex-col flex-1" style={{ gap: '2px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>Min</span>
              <input
                type="number"
                value={checkpoint.tolerance?.min ?? ''}
                onChange={(e) => handleToleranceChange('min', e.target.value)}
                disabled={!editingEnabled}
                className="w-full rounded"
                style={{ padding: '4px 6px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>
            <div className="flex flex-col flex-1" style={{ gap: '2px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>Nominal</span>
              <input
                type="number"
                value={checkpoint.tolerance?.nominal ?? ''}
                onChange={(e) => handleToleranceChange('nominal', e.target.value)}
                disabled={!editingEnabled}
                className="w-full rounded"
                style={{ padding: '4px 6px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', outline: 'none', fontWeight: 'var(--font-weight-bold)' }}
              />
            </div>
            <div className="flex flex-col flex-1" style={{ gap: '2px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>Max</span>
              <input
                type="number"
                value={checkpoint.tolerance?.max ?? ''}
                onChange={(e) => handleToleranceChange('max', e.target.value)}
                disabled={!editingEnabled}
                className="w-full rounded"
                style={{ padding: '4px 6px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>
            <div className="flex flex-col" style={{ gap: '2px', minWidth: '60px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>Unit</span>
              <select
                value={checkpoint.tolerance?.unit ?? 'mm'}
                onChange={(e) => handleToleranceChange('unit', e.target.value)}
                disabled={!editingEnabled}
                className="rounded"
                style={{ padding: '4px 4px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', outline: 'none' }}
              >
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pass/Fail tabs */}
      <div>
        <div className="flex" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <button
            onClick={() => setActiveTab('pass')}
            className="flex-1 flex items-center justify-center rounded-lg transition-all"
            style={{
              gap: '6px', padding: '8px',
              backgroundColor: activeTab === 'pass' ? '#ecfdf5' : 'var(--secondary)',
              color: activeTab === 'pass' ? '#059669' : 'var(--muted-foreground)',
              border: activeTab === 'pass' ? '1.5px solid #10b981' : '1.5px solid var(--border)',
              cursor: 'pointer', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
              fontWeight: activeTab === 'pass' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)'
            }}
          >
            <CheckCircle className="size-3.5" style={{ color: activeTab === 'pass' ? '#10b981' : 'var(--muted-foreground)' }} />
            Pass
          </button>
          <button
            onClick={() => setActiveTab('fail')}
            className="flex-1 flex items-center justify-center rounded-lg transition-all"
            style={{
              gap: '6px', padding: '8px',
              backgroundColor: activeTab === 'fail' ? '#fef2f2' : 'var(--secondary)',
              color: activeTab === 'fail' ? '#dc2626' : 'var(--muted-foreground)',
              border: activeTab === 'fail' ? '1.5px solid #ef4444' : '1.5px solid var(--border)',
              cursor: 'pointer', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
              fontWeight: activeTab === 'fail' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)'
            }}
          >
            <XCircle className="size-3.5" style={{ color: activeTab === 'fail' ? '#ef4444' : 'var(--muted-foreground)' }} />
            Fail
          </button>
        </div>

        <div className="rounded-lg" style={{ backgroundColor: 'var(--secondary)', padding: 'var(--spacing-md)', border: '1px solid var(--border)' }}>
          <OutcomeEditor
            key={`${checkpoint.id}-${activeTab}`}
            checkpoint={checkpoint}
            tab={activeTab}
            editingEnabled={editingEnabled}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export function ValidationPanel({
  validation,
  onAddValidation,
  onAddCheckpoint,
  onUpdateCheckpoint,
  onRemoveCheckpoint,
  onReorderCheckpoints,
  onRemoveValidation,
  activeCheckpointId,
  onSetActiveCheckpointId,
  editingEnabled,
  onClose,
  onSelectParts,
  onSetArrowDirection,
  isMobileView,
  availableParts
}: ValidationPanelProps) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const checkpoints = validation?.checkpoints ?? [];
  const criticalCount = checkpoints.filter(cp => cp.severity === 'critical').length;

  const handleToggleCheckpoint = (id: string) => {
    onSetActiveCheckpointId(activeCheckpointId === id ? null : id);
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newOrder = [...checkpoints];
    const [moved] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(idx, 0, moved);
    onReorderCheckpoints(newOrder);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // No validation yet - show empty state with "Add Validation" CTA
  if (!validation) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-lg flex flex-col items-center"
          style={{
            backgroundColor: 'var(--card)', border: '1px solid var(--border)',
            boxShadow: 'var(--elevation-lg)', padding: 'var(--spacing-2xl)',
            maxWidth: 'min(500px, calc(100vw - 32px))', margin: 'var(--spacing-lg)'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg transition-colors flex items-center justify-center"
            style={{ padding: 'var(--spacing-sm)', minHeight: '44px', minWidth: '44px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="size-5" />
          </button>

          <div className="flex flex-col items-center" style={{ gap: 'var(--spacing-lg)' }}>
            <div className="rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)', width: '64px', height: '64px' }}>
              <CheckCircle className="size-8" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="text-center">
              <h3 style={{ fontSize: 'var(--text-h3)', fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                No Checkpoints Yet
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)', margin: 0 }}>
                Add validation checkpoints to verify step completion with multiple pass/fail checks.
              </p>
            </div>
            {editingEnabled && (
              <button
                onClick={() => { onAddValidation(); }}
                className="flex items-center rounded-lg transition-all"
                style={{
                  gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-lg)',
                  minHeight: '44px',
                  backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                  border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-medium)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus className="size-4" />
                Add Validation
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Validation exists but no checkpoints yet — show empty checkpoint list
  const hasCheckpoints = checkpoints.length > 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-lg flex flex-col"
        style={{
          backgroundColor: 'var(--card)', border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-lg)', width: '90vw', maxWidth: 'min(580px, calc(100vw - 32px))',
          height: '85vh', maxHeight: '780px', margin: 'var(--spacing-md)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(59,130,246,0.1)' }}>
              <CheckCircle className="size-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)', margin: 0, lineHeight: '1.3' }}>
                Validation Checkpoints
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)', margin: 0 }}>
                {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''} for this step
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg transition-colors shrink-0 flex items-center justify-center"
            style={{ padding: 'var(--spacing-sm)', minHeight: '44px', minWidth: '44px', backgroundColor: 'var(--secondary)', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Checkpoint list - scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--spacing-lg)' }}>
          {!hasCheckpoints ? (
            // Empty checkpoints state
            <div className="flex flex-col items-center justify-center" style={{ padding: 'var(--spacing-2xl) 0', gap: 'var(--spacing-md)' }}>
              <div className="rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)', width: '48px', height: '48px' }}>
                <CheckCircle className="size-6" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)', margin: 0 }}>
                No checkpoints yet. Add one to get started.
              </p>
              {editingEnabled && (
                <button
                  onClick={onAddCheckpoint}
                  className="flex items-center rounded-lg transition-all"
                  style={{
                    gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-lg)',
                    minHeight: '44px',
                    backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                    border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  <Plus className="size-4" />
                  Add Checkpoint
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
              {checkpoints.map((cp, idx) => {
                const isExpanded = activeCheckpointId === cp.id;
                const sevCfg = SEVERITY_CONFIG[cp.severity];
                const typeCfg = TYPE_CONFIG[cp.type];
                const TypeIcon = typeCfg.icon;
                const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

                return (
                  <motion.div
                    key={cp.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    draggable={editingEnabled}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e as any, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className="rounded-lg overflow-hidden transition-shadow"
                    style={{
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      boxShadow: isDragOver ? '0 0 0 2px var(--primary)' : isExpanded ? 'var(--elevation-sm)' : 'none',
                      opacity: draggedIdx === idx ? 0.5 : 1
                    }}
                  >
                    {/* Checkpoint card header */}
                    <div
                      className="flex items-center cursor-pointer"
                      style={{ padding: 'var(--spacing-md)', gap: 'var(--spacing-sm)' }}
                      onClick={() => handleToggleCheckpoint(cp.id)}
                    >
                      {/* Severity color bar */}
                      <div className="shrink-0 rounded-sm" style={{ width: '4px', height: '32px', backgroundColor: sevCfg.color }} />

                      {/* Drag handle */}
                      {editingEnabled && (
                        <div className="shrink-0 cursor-grab" style={{ color: 'var(--muted-foreground)' }} onClick={(e) => e.stopPropagation()}>
                          <GripVertical className="size-3.5" />
                        </div>
                      )}

                      {/* Type icon */}
                      <TypeIcon className="size-4 shrink-0" style={{ color: sevCfg.color }} />

                      {/* Label + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                          <span style={{
                            fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {cp.label || 'Untitled checkpoint'}
                          </span>
                        </div>
                        <div className="flex items-center" style={{ gap: '6px', marginTop: '2px' }}>
                          <span className="rounded-full" style={{
                            fontSize: '10px', fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-bold)', backgroundColor: sevCfg.bg,
                            color: sevCfg.color, padding: '1px 6px', textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                          }}>
                            {sevCfg.label}
                          </span>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>
                            {typeCfg.label}
                          </span>
                          {cp.selectedParts.length > 0 && (
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>
                              · {cp.selectedParts.length} part{cp.selectedParts.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {cp.type === 'measurement' && cp.tolerance && (
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-family)', color: 'var(--muted-foreground)' }}>
                              · {cp.tolerance.nominal}{cp.tolerance.unit} ({cp.tolerance.min}–{cp.tolerance.max})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      {editingEnabled && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveCheckpoint(cp.id); }}
                          className="shrink-0 rounded transition-colors"
                          style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', opacity: 0.5 }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.opacity = '0.5'; }}
                          title="Remove checkpoint"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}

                      {/* Chevron */}
                      <div className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </div>
                    </div>

                    {/* Expanded editor */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div style={{ padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)', borderTop: '1px solid var(--border)' }}>
                            <CheckpointEditor
                              checkpoint={cp}
                              editingEnabled={editingEnabled}
                              onUpdate={(updates) => onUpdateCheckpoint(cp.id, updates)}
                              onSelectParts={onSelectParts}
                              onSetArrowDirection={onSetArrowDirection}
                              onClose={onClose}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Add Checkpoint button */}
              {editingEnabled && checkpoints.length < MAX_CHECKPOINTS && (
                <button
                  onClick={onAddCheckpoint}
                  className="flex items-center justify-center rounded-lg transition-all w-full"
                  style={{
                    gap: 'var(--spacing-sm)', padding: 'var(--spacing-md)',
                    minHeight: '44px',
                    backgroundColor: 'transparent', color: 'var(--primary)',
                    border: '2px dashed var(--border)', cursor: 'pointer',
                    fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-sm)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Plus className="size-4" />
                  Add Checkpoint
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderTop: '1px solid var(--border)', backgroundColor: 'var(--secondary)' }}
        >
          {editingEnabled ? (
            <button
              onClick={onRemoveValidation}
              className="flex items-center rounded-lg transition-colors"
              style={{
                gap: 'var(--spacing-xs)', padding: 'var(--spacing-sm) var(--spacing-md)',
                minHeight: '44px',
                backgroundColor: 'transparent', color: 'var(--muted-foreground)',
                border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-medium)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--destructive)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Trash2 className="size-4" />
              Remove All
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            <span style={{
              fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-medium)',
              color: criticalCount > 0 ? '#ef4444' : 'var(--muted-foreground)'
            }}>
              {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}{criticalCount > 0 ? ` (${criticalCount} critical)` : ''}
            </span>
            <button
              onClick={onClose}
              className="flex items-center rounded-lg transition-all"
              style={{
                gap: 'var(--spacing-xs)', padding: 'var(--spacing-sm) var(--spacing-lg)',
                minHeight: '44px',
                backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)',
                border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Done
              <CheckCircle className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
