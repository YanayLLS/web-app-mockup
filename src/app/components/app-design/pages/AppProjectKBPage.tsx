import { useNavigate, useParams } from 'react-router-dom';
import { FolderOpen, FileText, Film, ChevronRight, Plus, ChevronDown, X, Eye, RefreshCw, Cuboid } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AppProcedureInfoModal } from '../components/AppProcedureInfoModal';
import { getUrlParam, setUrlParam } from '../../../utils/urlParams';
import { useProject } from '../../../contexts/ProjectContext';
import { useRole, hasAccess } from '../../../contexts/RoleContext';

type KBItemType = 'folder' | 'procedure' | 'digital-twin' | 'media';

interface KBItem {
  id: string;
  name: string;
  type: KBItemType;
  description?: string;
  items?: number;
  steps?: number;
  lastUpdated: string;
  version?: string;
  image?: string;
}

const projectData: Record<string, { name: string; items: KBItem[] }> = {
  '915-i-series': {
    name: '915 i Series',
    items: [
      { id: 'f1', name: 'Maintenance Procedures', type: 'folder', items: 12, lastUpdated: '2 days ago' },
      { id: 'f2', name: 'Safety Protocols', type: 'folder', items: 8, lastUpdated: '1 week ago' },
      { id: 'f3', name: 'Training Materials', type: 'folder', items: 5, lastUpdated: '3 days ago' },
      { id: 'p1', name: 'Routine Maintenance for High-Volume Printing Equipment', type: 'procedure', steps: 35, lastUpdated: '4 hours ago', version: '1.5', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=150&fit=crop', description: 'Complete routine maintenance procedure covering safety prep, belt inspection, bearing lubrication, fluid checks, and final verification for high-volume printing equipment.' },
      { id: 'p2', name: 'Engine Calibration Procedure', type: 'procedure', steps: 22, lastUpdated: '1 day ago', version: '2.1', image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=200&h=150&fit=crop', description: 'Step-by-step calibration procedure for engine timing, fuel mixture, and governor settings.' },
      { id: 'p3', name: 'Belt Replacement Guide', type: 'procedure', steps: 15, lastUpdated: '3 days ago', version: '1.0', description: 'Guide for inspecting and replacing drive belts including tensioner adjustment and torque specifications.' },
      { id: 'dt1', name: 'Main Engine Assembly', type: 'digital-twin', description: 'Complete 3D model of the main engine', lastUpdated: '1 week ago' },
      { id: 'dt2', name: 'Hydraulic System', type: 'digital-twin', description: 'Hydraulic pump and valve assembly', lastUpdated: '5 days ago' },
      { id: 'm1', name: 'Installation Tutorial Video', type: 'media', description: 'Step-by-step video guide', lastUpdated: '2 days ago' },
      { id: 'm2', name: 'Wiring Diagram', type: 'media', description: 'Complete wiring schematic', lastUpdated: '1 week ago' },
    ],
  },
  'generator': {
    name: 'Generator',
    items: [
      { id: 'gen-dt1', name: 'Generator Digital Twin', type: 'digital-twin', description: 'Full 3D model of the diesel generator assembly with engine, alternator, control panel, and enclosure', lastUpdated: '1 day ago' },
      { id: 'gen-p1', name: 'Preventive Maintenance Procedure', type: 'procedure', steps: 10, lastUpdated: '1 day ago', version: '2.3', image: 'https://images.unsplash.com/photo-1656797654768-f3b5883a0fbf?w=200&h=150&fit=crop', description: 'Complete 10-step preventive maintenance procedure covering safety lockout, oil and coolant checks, air and fuel filter inspection, battery testing, belt and hose inspection, and load testing.' },
      { id: 'gen-p2', name: 'Air Filter Replacement', type: 'procedure', steps: 6, lastUpdated: '3 days ago', version: '1.1', description: 'Step-by-step guide for removing, inspecting, and replacing the engine air filter element including housing cleaning and restriction indicator reset.' },
      { id: 'gen-p3', name: 'Coolant System Flush & Refill', type: 'procedure', steps: 8, lastUpdated: '5 days ago', version: '1.0', description: 'Procedure for draining the cooling system, flushing with cleaning solution, inspecting hoses and thermostat, and refilling with the correct coolant mixture.' },
      { id: 'gen-p4', name: 'Fuel Filter & Water Separator Service', type: 'procedure', steps: 5, lastUpdated: '2 days ago', version: '1.4', description: 'Replacement of the primary fuel filter and draining of the fuel/water separator bowl, including fuel system bleeding and leak check.' },
      { id: 'gen-p5', name: 'Alternator Belt Removal & Installation', type: 'procedure', steps: 7, lastUpdated: '4 days ago', version: '2.0', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=150&fit=crop', description: 'Removal of the worn serpentine belt, inspection of pulleys and auto-tensioner, installation of the new belt with correct routing, and tension verification.' },
    ],
  },
  'manufacturing-alpha': {
    name: 'Manufacturing Facility Alpha',
    items: [
      { id: 'f1', name: 'Equipment Procedures', type: 'folder', items: 18, lastUpdated: '1 day ago' },
      { id: 'f2', name: 'Quality Control', type: 'folder', items: 10, lastUpdated: '3 days ago' },
      { id: 'p1', name: 'CNC Machine X500 Setup', type: 'procedure', steps: 28, lastUpdated: '5 hours ago', version: '3.2', image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=200&h=150&fit=crop' },
      { id: 'dt1', name: 'Assembly Line Robot AR-2000', type: 'digital-twin', description: 'Full robotic arm assembly', lastUpdated: '2 days ago' },
    ],
  },
};

// Fallback for unknown projects
const defaultProject = {
  name: 'Project',
  items: [
    { id: 'f1', name: 'Documentation', type: 'folder' as KBItemType, items: 5, lastUpdated: '1 day ago' },
    { id: 'p1', name: 'Getting Started Guide', type: 'procedure' as KBItemType, steps: 10, lastUpdated: '2 days ago', version: '1.0' },
    { id: 'dt1', name: 'Base Model', type: 'digital-twin' as KBItemType, description: '3D model overview', lastUpdated: '1 week ago' },
  ],
};


export function AppProjectKBPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProcName, setNewProcName] = useState('');
  const [newProcTwin, setNewProcTwin] = useState('');
  const [selectedItem, setSelectedItem] = useState<KBItem | null>(null);
  const [loadingDT, setLoadingDT] = useState<KBItem | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const { dtThumbnail } = useProject();
  const { currentRole } = useRole();
  const canCreate = hasAccess(currentRole, 'create-content');

  const selectItem = (item: KBItem | null) => {
    setSelectedItem(item);
    setUrlParam('open', item?.id ?? null);
  };

  const rawProject = projectData[projectId || ''] || defaultProject;
  // Use captured DT thumbnail for generator project items
  const project = projectId === 'generator' && dtThumbnail
    ? { ...rawProject, items: rawProject.items.map(item =>
        item.type === 'digital-twin' || (item.type === 'procedure' && item.image)
          ? { ...item, image: dtThumbnail }
          : item
      )}
    : rawProject;

  // Auto-open procedure from URL ?open= param
  useEffect(() => {
    const openId = getUrlParam('open');
    if (openId && !selectedItem) {
      const item = project.items.find(i => i.id === openId);
      if (item) setSelectedItem(item);
    }
  }, []);

  // Digital twin loading animation
  useEffect(() => {
    if (!loadingDT) return;
    setLoadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 8 + Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoadingDT(null);
          navigate('/app/3d-viewer');
        }, 200);
      }
      setLoadProgress(progress);
    }, 80);
    return () => clearInterval(interval);
  }, [loadingDT]);

  // Group by type
  const folders = project.items.filter(i => i.type === 'folder');
  const procedures = project.items.filter(i => i.type === 'procedure');
  const digitalTwins = project.items.filter(i => i.type === 'digital-twin');
  const media = project.items.filter(i => i.type === 'media');

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ padding: '16px' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 mb-4"
        style={{
          border: '1px solid #C2C9DB',
          borderRadius: '10px',
          padding: '0 16px',
          height: '48px',
          backgroundColor: 'white',
        }}
      >
        {canCreate && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity min-h-[44px]"
            style={{ color: '#2F80ED', fontWeight: 'var(--font-weight-bold)' }}
          >
            <Plus className="size-4" />
            Create
          </button>
        )}
        <div className="flex-1" />
        <button className="p-2 sm:p-1.5 hover:bg-secondary rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" style={{ color: '#7F7F7F' }}>
          <Eye className="size-4" />
        </button>
        <button className="p-2 sm:p-1.5 hover:bg-secondary rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" style={{ color: '#7F7F7F' }}>
          <RefreshCw className="size-4" />
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto" style={{ fontSize: '14px' }}>
        <button
          onClick={() => navigate('/app/knowledgebase')}
          className="hover:underline transition-colors shrink-0"
          style={{ color: '#2F80ED' }}
        >
          Knowledge Base
        </button>
        <ChevronRight className="size-3 shrink-0" style={{ color: '#7F7F7F' }} />
        <span className="shrink-0" style={{ fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
          {project.name}
        </span>
      </div>

      {/* Item grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px, 100%), 1fr))', gap: '10px' }}>
        {/* Folders */}
        {folders.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/app/project/${projectId}/folder/${item.id}`)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all"
            style={{
              width: '100%',
              height: '172px',
              borderRadius: '10px',
              backgroundColor: 'white',
              border: '1px solid #E9E9E9',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <FolderOpen style={{ width: '48px', height: '48px', color: '#2F80ED' }} />
              <div className="mt-2 text-center px-3 truncate w-full" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '12px', color: '#7F7F7F', marginTop: '2px' }}>
                {item.items} items
              </div>
            </div>
          </div>
        ))}

        {/* Procedures */}
        {procedures.map((item) => (
          <div
            key={item.id}
            onClick={() => selectItem(item)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all"
            style={{
              width: '100%',
              height: '172px',
              borderRadius: '10px',
              position: 'relative',
            }}
          >
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#E9E9E9' }}>
                <FileText style={{ width: '48px', height: '48px', color: '#2F80ED' }} />
              </div>
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)' }} />
            <div
              className="absolute flex items-center gap-1 px-2 py-1"
              style={{ top: '8px', left: '8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'var(--font-weight-bold)', color: 'white', border: '1px solid #2F80ED', backgroundColor: 'rgba(47,128,237,0.5)' }}
            >
              <FileText style={{ width: '12px', height: '12px' }} />
              Flow
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: 'white' }}>
              {item.name}
            </div>
          </div>
        ))}

        {/* Digital Twins */}
        {digitalTwins.map((item) => (
          <div
            key={item.id}
            onClick={() => setLoadingDT(item)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all"
            style={{
              width: '100%',
              height: '172px',
              borderRadius: '10px',
              position: 'relative',
              backgroundColor: '#E9E9E9',
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Cuboid style={{ width: '48px', height: '48px', color: '#8404B3' }} />
            </div>
            <div
              className="absolute flex items-center gap-1 px-2 py-1"
              style={{ top: '8px', left: '8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'var(--font-weight-bold)', color: 'white', border: '1px solid #8404B3', backgroundColor: 'rgba(132,4,179,0.5)' }}
            >
              <Cuboid style={{ width: '12px', height: '12px' }} />
              Digital Twin
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
              {item.name}
            </div>
          </div>
        ))}

        {/* Media */}
        {media.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/app/project/${projectId}/procedure/${item.id}`)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all"
            style={{
              width: '100%',
              height: '172px',
              borderRadius: '10px',
              backgroundColor: 'white',
              border: '1px solid #E9E9E9',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <Film style={{ width: '48px', height: '48px', color: '#ff9500' }} />
              <div className="mt-2 text-center px-3 truncate w-full" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                {item.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Procedure Info Modal (only for procedures, not digital twins) */}
      {selectedItem && (
        <AppProcedureInfoModal
          procedure={{
            id: selectedItem.id,
            projectId: projectId || '',
            name: selectedItem.name,
            type: selectedItem.type === 'digital-twin' ? 'digital-twin' : 'procedure',
            steps: selectedItem.steps,
            lastUpdated: selectedItem.lastUpdated,
            version: selectedItem.version,
            description: selectedItem.description,
            thumbnail: selectedItem.image,
          }}
          onClose={() => selectItem(null)}
        />
      )}

      {/* Digital Twin Loading Modal */}
      {loadingDT && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setLoadingDT(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div
              className="pointer-events-auto flex flex-col items-center"
              style={{
                width: '480px',
                maxWidth: '100%',
                backgroundColor: '#F5F5F5',
                border: '1px solid #C2C9DB',
                borderRadius: '10px',
                boxShadow: '0px 4px 14.2px 0px rgba(0,0,0,0.25)',
                padding: '24px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex items-center justify-end w-full" style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setLoadingDT(null)}
                  className="flex items-center justify-center hover:bg-white/50 transition-colors"
                  style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                >
                  <X style={{ width: '14px', height: '14px', color: '#36415D' }} />
                </button>
              </div>

              {/* 3D Preview placeholder */}
              <div
                className="w-full flex items-center justify-center"
                style={{
                  height: '200px',
                  backgroundColor: '#D9DFD4',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              >
                <Cuboid style={{ width: '64px', height: '64px', color: '#7F9B8E', opacity: 0.6 }} />
              </div>

              {/* Title */}
              <div className="w-full" style={{ marginBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', lineHeight: '1.3' }}>
                  {loadingDT.name}
                </h3>
              </div>

              {/* Meta */}
              <div className="flex items-center w-full" style={{ marginBottom: '16px', gap: '10px', fontSize: '12px', color: '#7F7F7F' }}>
                <span>Last updated: {loadingDT.lastUpdated}</span>
                {loadingDT.version && <span>|</span>}
                {loadingDT.version && <span>Version {loadingDT.version}</span>}
              </div>

              {/* Content creator area - only for roles with edit access */}
              {hasAccess(currentRole, 'projects-edit') && (
                <div
                  className="w-full flex items-center justify-between"
                  style={{
                    backgroundColor: '#E9E9E9',
                    borderRadius: '25px',
                    padding: '10px 16px',
                    marginBottom: '20px',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                    Content creator area
                  </span>
                  <button
                    onClick={() => {
                      window.open(`/web/project/915-i-series/knowledgebase?open=${loadingDT.id}`, '_blank');
                    }}
                    className="hover:underline"
                    style={{ fontSize: '12px', color: '#2F80ED' }}
                  >
                    Settings (external)
                  </button>
                </div>
              )}

              {/* Loading progress */}
              <div className="w-full flex flex-col items-center" style={{ gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semibold)', color: '#36415D' }}>
                  Loading &nbsp;{Math.min(Math.round(loadProgress), 100)} %
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#E9E9E9',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(loadProgress, 100)}%`,
                      height: '100%',
                      backgroundColor: '#2F80ED',
                      borderRadius: '3px',
                      transition: 'width 0.15s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* New Procedure Dialog */}
      {showCreateDialog && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCreateDialog(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div
              className="bg-card rounded-[var(--radius)] shadow-elevation-lg w-full max-w-md pointer-events-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-foreground mb-4" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h4)' }}>
                New Flow
              </h3>

              <div className="mb-4">
                <label className="text-xs text-muted mb-1.5 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Name the flow
                </label>
                <input
                  type="text"
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  placeholder="Enter flow name..."
                  className="w-full px-3 py-2.5 bg-card rounded-[var(--radius)] text-sm text-foreground border border-border outline-none placeholder:text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="text-xs text-muted mb-1.5 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Connect to a digital twin
                </label>
                <div className="relative">
                  <select
                    value={newProcTwin}
                    onChange={(e) => setNewProcTwin(e.target.value)}
                    className="w-full px-3 py-2.5 bg-card rounded-[var(--radius)] text-sm text-foreground border border-border outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:border-transparent pr-8"
                  >
                    <option value="">None</option>
                    <option value="Main Engine Assembly">Main Engine Assembly</option>
                    <option value="Hydraulic System">Hydraulic System</option>
                    <option value="Assembly Line Robot AR-2000">Assembly Line Robot AR-2000</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowCreateDialog(false); setNewProcName(''); setNewProcTwin(''); }}
                  className="px-5 py-2.5 min-h-[44px] bg-destructive text-white rounded-[var(--radius-button)] text-sm hover:bg-destructive/90 transition-colors"
                  style={{ fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowCreateDialog(false); setNewProcName(''); setNewProcTwin(''); }}
                  className="px-5 py-2.5 min-h-[44px] bg-primary text-white rounded-[var(--radius-button)] text-sm hover:bg-primary/90 transition-colors"
                  style={{ fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

