import { useNavigate, useParams } from 'react-router-dom';
import { X, FileText, ChevronDown, Upload, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AppPublishModal } from '../components/AppPublishModal';
import { useRole, hasAccess } from '../../../contexts/RoleContext';

interface SettingsState {
  title: string;
  description: string;
  enable2D: boolean;
  optionAutoProceeds: boolean;
  autoSkipSteps: boolean;
  showSurvey: boolean;
  readHeaders: boolean;
  readDescriptions: boolean;
  waitForNarration: boolean;
  aiInstructions: string;
  connectedTwin: string;
}

export function AppProcedureSettingsPage() {
  const navigate = useNavigate();
  const { projectId, procedureId } = useParams();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const { currentRole } = useRole();
  const canPublish = hasAccess(currentRole, 'publish-content');
  const canEdit = hasAccess(currentRole, 'projects-edit');

  const [settings, setSettings] = useState<SettingsState>({
    title: 'Elitebook 840 G9',
    description: 'This procedure covers the complete maintenance workflow for the Elitebook 840 G9 laptop series.',
    enable2D: true,
    optionAutoProceeds: false,
    autoSkipSteps: false,
    showSurvey: true,
    readHeaders: true,
    readDescriptions: false,
    waitForNarration: true,
    aiInstructions: 'This is a step-by-step maintenance guide for the HP Elitebook 840 G9. It covers battery replacement, keyboard swap, and SSD upgrade procedures. Technicians should have basic electronics repair experience.',
    connectedTwin: 'Elitebook 840 G9 Assembly',
  });

  const update = (key: keyof SettingsState, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="size-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#36415D15' }}>
            <FileText className="size-5" style={{ color: '#36415D' }} />
          </div>
          <h3 className="text-foreground" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h4)' }}>
            Procedure settings
          </h3>
          <button className="text-xs text-primary hover:underline ml-1">
            More settings
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-destructive/10 text-destructive" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Unpublished changes
            </span>
            <span className="text-xs text-muted hidden sm:inline">Published Version 1.5</span>
            {canPublish && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-4 py-2 min-h-[44px] bg-accent text-foreground rounded-[var(--radius-button)] text-sm hover:bg-accent/90 transition-colors"
                style={{ fontWeight: 'var(--font-weight-semibold)', color: '#fff', backgroundColor: '#11E874' }}
              >
                Publish
              </button>
            )}
            <button
              onClick={() => navigate(`/app/project/${projectId}/procedure/${procedureId}`)}
              className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <label className="text-xs text-muted mb-1.5 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => update('title', e.target.value)}
              disabled={!canEdit}
              className={`w-full px-3 py-2.5 min-h-[44px] bg-card rounded-[var(--radius)] text-foreground border border-border outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Image + Description row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image upload */}
            <div>
              <label className="text-xs text-muted mb-1.5 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Image</label>
              <div className={`aspect-video bg-card rounded-[var(--radius)] border-2 border-dashed border-border flex flex-col items-center justify-center transition-colors ${canEdit ? 'cursor-pointer hover:border-primary/50' : 'opacity-60 cursor-not-allowed'}`}>
                <Upload className="size-8 text-muted mb-2" />
                <p className="text-xs text-muted">Click to upload an image</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-muted mb-1.5 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => update('description', e.target.value)}
                rows={6}
                disabled={!canEdit}
                className={`w-full px-3 py-2.5 bg-card rounded-[var(--radius)] text-sm text-foreground border border-border outline-none resize-none focus:ring-2 focus:ring-primary focus:border-transparent ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Two-column settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logics */}
            <div className="bg-card rounded-[var(--radius)] p-4 border border-border">
              <h4 className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>Logics</h4>
              <div className="space-y-3">
                <CheckboxField label="Enable 2D" checked={settings.enable2D} onChange={(v) => update('enable2D', v)} disabled={!canEdit} />
                <CheckboxField label="Option selection auto proceeds" checked={settings.optionAutoProceeds} onChange={(v) => update('optionAutoProceeds', v)} disabled={!canEdit} />
                <CheckboxField label="Auto skip steps" checked={settings.autoSkipSteps} onChange={(v) => update('autoSkipSteps', v)} disabled={!canEdit} />
                <CheckboxField label="Show survey" checked={settings.showSurvey} onChange={(v) => update('showSurvey', v)} disabled={!canEdit} />
              </div>
            </div>

            {/* Text to speech */}
            <div className="bg-card rounded-[var(--radius)] p-4 border border-border">
              <h4 className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>Text to speech</h4>
              <div className="space-y-3">
                <CheckboxField label="Read headers" checked={settings.readHeaders} onChange={(v) => update('readHeaders', v)} disabled={!canEdit} />
                <CheckboxField label="Read descriptions" checked={settings.readDescriptions} onChange={(v) => update('readDescriptions', v)} disabled={!canEdit} />
                <CheckboxField label="Wait for narration" checked={settings.waitForNarration} onChange={(v) => update('waitForNarration', v)} disabled={!canEdit} />
              </div>
            </div>
          </div>

          {/* AI Instructions */}
          <div className="bg-card rounded-[var(--radius)] p-4 border border-border">
            <h4 className="text-sm text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>AI Instructions</h4>
            <p className="text-xs text-muted mb-2">Make it easier for AI chat to find this procedure</p>
            {canEdit && (
              <button className="text-xs text-primary hover:underline mb-3 flex items-center gap-1">
                <Sparkles className="size-3" />
                Summarize with AI
              </button>
            )}
            <textarea
              value={settings.aiInstructions}
              onChange={(e) => update('aiInstructions', e.target.value)}
              rows={4}
              disabled={!canEdit}
              className={`w-full px-3 py-2.5 bg-background rounded-[var(--radius)] text-sm text-foreground border border-border outline-none resize-none focus:ring-2 focus:ring-primary focus:border-transparent ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Connected Digital Twin */}
          <div>
            <label className="text-xs text-muted mb-1.5 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Connected Digital Twin</label>
            <div className="relative">
              <select
                value={settings.connectedTwin}
                onChange={(e) => update('connectedTwin', e.target.value)}
                disabled={!canEdit}
                className={`w-full px-3 py-2.5 min-h-[44px] bg-card rounded-[var(--radius)] text-sm text-foreground border border-border outline-none appearance-none focus:ring-2 focus:ring-primary focus:border-transparent pr-8 ${canEdit ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              >
                <option value="">None</option>
                <option value="Elitebook 840 G9 Assembly">Elitebook 840 G9 Assembly</option>
                <option value="Main Engine Assembly">Main Engine Assembly</option>
                <option value="Hydraulic System">Hydraulic System</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Publish modal */}
      {showPublishModal && (
        <AppPublishModal
          currentVersion="1.5"
          onClose={() => setShowPublishModal(false)}
          onPublish={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2.5 group min-h-[44px] ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <div
        className={`size-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
          checked ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
        }`}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
      >
        {checked && (
          <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
