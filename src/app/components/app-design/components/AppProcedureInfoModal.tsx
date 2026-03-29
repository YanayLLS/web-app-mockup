import { useState, useMemo } from 'react';
import { X, Globe, ChevronDown, Play, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole, hasAccess } from '../../../contexts/RoleContext';
import { AppConfigurationSelector } from './AppConfigurationSelector';
import { MOCK_CONFIGURATIONS } from '../../../data/configurationsData';

interface ProcedureInfo {
  id: string;
  projectId: string;
  name: string;
  type: 'procedure' | 'digital-twin';
  steps?: number;
  lastUpdated: string;
  version?: string;
  description?: string;
  thumbnail?: string;
  digitalTwinName?: string;
  configurationName?: string;
  modeName?: string;
}

interface AppProcedureInfoModalProps {
  procedure: ProcedureInfo;
  onClose: () => void;
}

export function AppProcedureInfoModal({ procedure, onClose }: AppProcedureInfoModalProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const { currentRole } = useRole();
  const isContentCreator = currentRole === 'content-creator' || currentRole === 'admin';
  const [showConfigSelector, setShowConfigSelector] = useState(false);

  // Auto-select default configuration — no "None" option
  const defaultConfig = useMemo(() => {
    const accessible = MOCK_CONFIGURATIONS.filter(
      (c) => c.isEnabled && c.permittedRoles.includes(currentRole)
    );
    return accessible.find((c) => c.isDefault) ?? accessible[0] ?? null;
  }, [currentRole]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(
    procedure.configurationName ? null : (defaultConfig?.id ?? null)
  );
  const [selectedConfigName, setSelectedConfigName] = useState<string | null>(
    procedure.configurationName || defaultConfig?.name || null
  );

  const handleRunIn3D = () => {
    onClose();
    if (procedure.type === 'procedure') {
      // Open procedure in VIEW mode (no editing), pass config if selected
      const configParam = selectedConfigName ? `&config=${encodeURIComponent(selectedConfigName)}` : '';
      navigate(`/app/procedure-editor/${procedure.id}?mode=view${configParam}`);
    } else {
      const configParam = selectedConfigName ? `?config=${encodeURIComponent(selectedConfigName)}` : '';
      navigate(`/app/3d-viewer${configParam}`);
    }
  };

  const handleSettings = () => {
    window.open(`/web/project/915-i-series/knowledgebase?open=${procedure.id}`, '_blank');
  };

  const handleEdit = () => {
    // Open procedure in EDIT mode
    onClose();
    navigate(`/app/procedure-editor/${procedure.id}?mode=edit`);
  };

  const handleRunIn2D = () => {
    onClose();
    navigate('/app/3d-viewer');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto flex flex-col items-center overflow-y-auto w-full sm:w-[548px]"
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            backgroundColor: '#F5F5F5',
            border: '1px solid #C2C9DB',
            borderRadius: '10px',
            boxShadow: '0px 4px 14.2px 0px rgba(0,0,0,0.25)',
            padding: '16px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar: Language + Close */}
          <div className="flex items-center w-full" style={{ marginBottom: '8px' }}>
            {/* Language dropdown */}
            <button
              className="flex items-center gap-2 hover:bg-white/50 transition-colors"
              style={{ padding: '8px', borderRadius: '10px' }}
            >
              <Globe style={{ width: '16px', height: '16px', color: '#36415D' }} />
              <span style={{ fontSize: '14px', color: '#36415D', fontWeight: 'var(--font-weight-normal)' }}>
                {language}
              </span>
              <ChevronDown style={{ width: '16px', height: '16px', color: '#36415D' }} />
            </button>

            <div className="flex-1" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center hover:bg-white/50 transition-colors"
              style={{ width: '44px', height: '44px', borderRadius: '10px' }}
              aria-label="Close"
            >
              <X style={{ width: '14px', height: '14px', color: '#36415D' }} />
            </button>
          </div>

          {/* Procedure thumbnail */}
          {procedure.thumbnail && (
            <div style={{ marginBottom: '12px', width: '100%', maxWidth: '274px' }}>
              <img
                src={procedure.thumbnail}
                alt={procedure.name}
                style={{ width: '100%', maxWidth: '274px', height: 'auto', aspectRatio: '274/154', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Title */}
          <div className="w-full" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', lineHeight: '1.3' }}>
              {procedure.name}
            </h3>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center w-full" style={{ marginBottom: '12px', gap: '6px 10px', fontSize: '12px', color: '#36415D' }}>
            {procedure.steps && <span>{procedure.steps} steps estimated</span>}
            {procedure.steps && <span>|</span>}
            <span>Last updated {procedure.lastUpdated}</span>
            {procedure.version && <span>|</span>}
            {procedure.version && <span>Version {procedure.version}</span>}
          </div>

          {/* Description */}
          {procedure.description && (
            <div className="w-full" style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#36415D', lineHeight: '1.5' }}>
                {procedure.description}
              </p>
            </div>
          )}

          {/* Digital twin / Configuration / Mode rows */}
          <div
            className="flex flex-col w-full"
            style={{
              gap: '6px',
              marginBottom: '16px',
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E9E9E9',
            }}
          >
            {/* Digital twin row */}
            <div className="flex items-center" style={{ gap: '8px', minHeight: '32px' }}>
              <span className="shrink-0" style={{ width: '94px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Digital twin
              </span>
              <span className="truncate flex-1" style={{ fontSize: '13px', color: '#36415D', fontWeight: 'var(--font-weight-medium)' }}>
                {procedure.digitalTwinName || 'Digital Twin Name'}
              </span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F5F5F5' }} />

            {/* Configuration row */}
            <div className="flex items-center" style={{ gap: '8px', minHeight: '32px' }}>
              <span className="shrink-0" style={{ width: '94px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Configuration
              </span>
              <button
                onClick={() => setShowConfigSelector(true)}
                className="flex-1 flex items-center justify-between hover:bg-[#E9E9E9]/50 active:scale-[0.98] transition-all min-w-0"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #C2C9DB',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <span className="truncate" style={{ fontSize: '13px', color: '#36415D', fontWeight: 'var(--font-weight-medium)' }}>
                  {selectedConfigName}
                </span>
                <ChevronDown style={{ width: '14px', height: '14px', color: '#868D9E', flexShrink: 0 }} />
              </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F5F5F5' }} />

            {/* Mode row */}
            <div className="flex items-center" style={{ gap: '8px', minHeight: '32px' }}>
              <span className="shrink-0" style={{ width: '94px', fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Mode
              </span>
              <span className="truncate flex-1" style={{ fontSize: '13px', color: '#36415D', fontWeight: 'var(--font-weight-medium)' }}>
                {procedure.modeName || '3D mode name'}
              </span>
            </div>
          </div>

          {/* Action buttons - Run vs Edit */}
          <div className="w-full flex gap-3" style={{ marginBottom: '10px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {/* Run in 3D - Primary action (green accent) */}
            <button
              onClick={handleRunIn3D}
              className="flex-1 flex items-center justify-center gap-2 text-white hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                padding: '14px 16px',
                backgroundColor: '#11E874',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-bold)',
                color: '#1a1a1a',
                boxShadow: '0 2px 8px rgba(17,232,116,0.3)',
              }}
            >
              <Play style={{ width: '16px', height: '16px', fill: 'currentColor' }} />
              Run in 3D
            </button>

            {/* Edit - Secondary action (content creator only) */}
            {isContentCreator && (
              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  padding: '14px 20px',
                  backgroundColor: '#2F80ED',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(47,128,237,0.3)',
                }}
              >
                <Pencil style={{ width: '14px', height: '14px' }} />
                Edit
              </button>
            )}
          </div>

          {/* Content creator settings link */}
          {isContentCreator && (
            <div className="w-full flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#7F7F7F' }}>
                Last updated {procedure.lastUpdated} by User Name
              </span>
              <button
                onClick={handleSettings}
                className="hover:underline"
                style={{ fontSize: '11px', color: '#2F80ED' }}
              >
                Settings
              </button>
            </div>
          )}

          {/* Don't need a digital twin link */}
          <button
            onClick={handleRunIn2D}
            className="flex items-center justify-center hover:underline"
            style={{ fontSize: '12px', color: '#2F80ED', padding: '2px' }}
          >
            Don't need a digital twin?
          </button>
        </div>
      </div>

      {/* Configuration Selector Modal */}
      <AppConfigurationSelector
        isOpen={showConfigSelector}
        onClose={() => setShowConfigSelector(false)}
        onSelect={(configId, configName) => {
          setSelectedConfigId(configId);
          setSelectedConfigName(configName);
          setShowConfigSelector(false);
        }}
      />
    </>
  );
}
