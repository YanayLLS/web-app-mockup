import { useNavigate, useParams } from 'react-router-dom';
import { FolderOpen, FileText, ChevronRight, Cuboid, Plus, Eye, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AppProcedureInfoModal } from '../components/AppProcedureInfoModal';
import { getUrlParam, setUrlParam } from '../../../utils/urlParams';
import { useRole, hasAccess } from '../../../contexts/RoleContext';

type TabType = 'flows-media' | 'digital-twins';

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'procedure' | 'media' | '3d-model' | 'digital-twin';
  itemCount?: number;
  date?: string;
  thumbnail?: string;
  source?: string;
  badgeType?: 'procedure' | 'digital-twin';
  steps?: number;
  version?: string;
  description?: string;
  digitalTwinName?: string;
}

interface FolderData {
  name: string;
  parentId?: string;
  parentName?: string;
  breadcrumbs: { id: string; name: string }[];
  flowsMedia: FolderItem[];
  digitalTwins: FolderItem[];
}

const foldersData: Record<string, FolderData> = {
  'f1': {
    name: 'Maintenance Procedures',
    parentId: undefined,
    parentName: '915 i Series',
    breadcrumbs: [
      { id: 'workspace', name: 'Workspace name' },
      { id: 'project', name: 'Project name' },
      { id: 'folder', name: 'Folder name' },
    ],
    flowsMedia: [
      { id: 'sf1', name: 'Monthly Checks', type: 'folder', itemCount: 27 },
      { id: 'sf2', name: 'Annual Overhaul', type: 'folder', itemCount: 14 },
      { id: 'sp1', name: 'Routine Maintenance for High-Volume Printing', type: 'procedure', date: '01/05/2025', thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', badgeType: 'procedure', steps: 35, version: '1.5', description: 'Procedure description text if it has any. This text stretches from end to and and can have multiple lines drop. This lets the user know what the content creator added to this field, and have a better understanding of the procedure beforehand.', digitalTwinName: 'Main Engine Assembly' },
      { id: 'sp2', name: 'Belt Replacement Guide', type: 'procedure', date: '02/15/2024', thumbnail: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop', badgeType: 'procedure', steps: 15, version: '1.0', description: 'Step-by-step guide for belt replacement on 915 i Series equipment.' },
      { id: 'sdt1', name: 'Main Engine Assembly', type: 'digital-twin', date: '02/12/2024', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', badgeType: 'digital-twin', description: 'Complete 3D model of the main engine assembly.' },
      { id: 'sp3', name: 'Engine Calibration Procedure', type: 'procedure', date: '02/10/2024', thumbnail: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop', badgeType: 'procedure', steps: 22, version: '2.1', description: 'Calibration steps for the engine control system.', digitalTwinName: 'Main Engine Assembly' },
    ],
    digitalTwins: [
      { id: 'sdt1', name: 'Main Engine Assembly', type: '3d-model', source: 'Frontline 3D', date: '02/12/2024', description: 'Complete 3D model of the main engine assembly.' },
      { id: 'sdt2', name: 'Hydraulic Pump Module', type: '3d-model', source: 'Frontline 3D', date: '01/30/2024', description: 'Hydraulic pump and valve assembly model.' },
    ],
  },
  'f2': {
    name: 'Safety Protocols',
    parentId: undefined,
    parentName: '915 i Series',
    breadcrumbs: [
      { id: 'workspace', name: 'Workspace name' },
      { id: 'project', name: '915 i Series' },
    ],
    flowsMedia: [
      { id: 'sf3', name: 'Emergency Procedures', type: 'folder', itemCount: 4 },
      { id: 'sp3', name: 'Fire Safety Protocol', type: 'procedure', date: '02/01/2024', thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', badgeType: 'procedure', steps: 12, version: '1.0' },
      { id: 'sp4', name: 'Chemical Handling Guidelines', type: 'procedure', date: '01/20/2024', badgeType: 'procedure', steps: 18, version: '2.0' },
    ],
    digitalTwins: [
      { id: 'sdt3', name: 'Safety Equipment Layout', type: '3d-model', source: 'Frontline 3D', date: '02/05/2024' },
    ],
  },
  'f3': {
    name: 'Training Materials',
    parentId: undefined,
    parentName: '915 i Series',
    breadcrumbs: [
      { id: 'workspace', name: 'Workspace name' },
      { id: 'project', name: '915 i Series' },
    ],
    flowsMedia: [
      { id: 'sp5', name: 'Onboarding Procedure', type: 'procedure', date: '02/18/2024', thumbnail: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop', badgeType: 'procedure', steps: 20, version: '1.0' },
      { id: 'sdt2', name: '3D Model Overview', type: 'digital-twin', date: '02/08/2024', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', badgeType: 'digital-twin' },
    ],
    digitalTwins: [],
  },
};

const defaultFolder: FolderData = {
  name: 'Folder',
  breadcrumbs: [{ id: 'workspace', name: 'Workspace' }, { id: 'project', name: 'Project' }],
  flowsMedia: [
    { id: 'df1', name: 'Subfolder', type: 'folder', itemCount: 3 },
    { id: 'dp1', name: 'Sample Procedure', type: 'procedure', date: '02/20/2024', badgeType: 'procedure' },
  ],
  digitalTwins: [],
};

export function AppFolderBrowsePage() {
  const navigate = useNavigate();
  const { projectId, folderId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('flows-media');
  const [selectedItem, setSelectedItem] = useState<FolderItem | null>(null);
  const [loadingDT, setLoadingDT] = useState<FolderItem | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const { currentRole } = useRole();
  const canCreate = hasAccess(currentRole, 'create-content');

  const selectItem = (item: FolderItem | null) => {
    setSelectedItem(item);
    setUrlParam('open', item?.id ?? null);
  };

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

  const folder = foldersData[folderId || ''] || defaultFolder;

  // Auto-open procedure from URL ?open= param
  useEffect(() => {
    const openId = getUrlParam('open');
    if (openId && !selectedItem) {
      const item = [...folder.flowsMedia, ...folder.digitalTwins].find(i => i.id === openId);
      if (item) setSelectedItem(item);
    }
  }, []);

  const filteredFlowsMedia = folder.flowsMedia.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDigitalTwins = folder.digitalTwins.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: FolderItem) => {
    if (item.type === 'folder') {
      navigate(`/app/project/${projectId}/folder/${item.id}`);
    } else if (item.type === 'digital-twin' || item.badgeType === 'digital-twin') {
      // Digital twin items show loading then navigate directly
      setLoadingDT(item);
    } else {
      // Procedures open the info modal
      selectItem(item);
    }
  };

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
        {folder.breadcrumbs.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => navigate(`/app/project/${projectId}/kb`)}
              className="hover:underline transition-colors min-h-[44px] flex items-center"
              style={{ color: '#2F80ED', fontWeight: 'var(--font-weight-normal)' }}
            >
              {crumb.name}
            </button>
            <ChevronRight className="size-3" style={{ color: '#7F7F7F' }} />
          </span>
        ))}
        <span className="shrink-0" style={{ fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
          {folder.name}
        </span>
      </div>

      {/* Item grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px, 100%), 1fr))', gap: '10px' }}>
        {activeTab === 'flows-media' && filteredFlowsMedia.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all"
            style={{
              width: '100%',
              maxWidth: '249px',
              height: '172px',
              borderRadius: '10px',
              position: 'relative',
              backgroundColor: 'white',
              border: '1px solid #E9E9E9',
            }}
          >
            {item.type === 'folder' ? (
              /* Folder card */
              <div className="flex flex-col items-center justify-center h-full">
                <FolderOpen style={{ width: '48px', height: '48px', color: '#2F80ED' }} />
                <div
                  className="mt-2 text-center px-3 truncate w-full"
                  style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: '#7F7F7F', marginTop: '2px' }}>
                  {item.itemCount} Items
                </div>
              </div>
            ) : (
              /* Thumbnail card with gradient and badge */
              <div className="relative w-full h-full">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#E9E9E9' }}>
                    {item.badgeType === 'digital-twin' ? (
                      <Cuboid style={{ width: '48px', height: '48px', color: '#8404B3' }} />
                    ) : (
                      <FileText style={{ width: '48px', height: '48px', color: '#2F80ED' }} />
                    )}
                  </div>
                )}
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)' }}
                />
                {/* Type badge - top left */}
                {item.badgeType && (
                  <div
                    className="absolute flex items-center gap-1 px-2 py-1"
                    style={{
                      top: '8px',
                      left: '8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'white',
                      border: item.badgeType === 'digital-twin' ? '1px solid #8404B3' : '1px solid #2F80ED',
                      backgroundColor: item.badgeType === 'digital-twin' ? 'rgba(132,4,179,0.5)' : 'rgba(47,128,237,0.5)',
                    }}
                  >
                    {item.badgeType === 'digital-twin' ? (
                      <Cuboid style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <FileText style={{ width: '12px', height: '12px' }} />
                    )}
                    {item.badgeType === 'digital-twin' ? 'Digital Twin' : 'Flow'}
                  </div>
                )}
                {/* Name - bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 pb-2 truncate"
                  style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: 'white' }}
                >
                  {item.name}
                </div>
              </div>
            )}
          </div>
        ))}

        {activeTab === 'digital-twins' && filteredDigitalTwins.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="cursor-pointer overflow-hidden hover:shadow-elevation-md transition-all flex flex-col items-center justify-center"
            style={{
              width: '100%',
              maxWidth: '249px',
              height: '172px',
              borderRadius: '10px',
              backgroundColor: 'white',
              border: '1px solid #E9E9E9',
            }}
          >
            <Cuboid style={{ width: '48px', height: '48px', color: '#8404B3' }} />
            <div
              className="mt-2 text-center px-3 truncate w-full"
              style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}
            >
              {item.name}
            </div>
            <div style={{ fontSize: '12px', color: '#7F7F7F', marginTop: '2px' }}>
              {item.source}
            </div>
          </div>
        ))}
      </div>

      {((activeTab === 'flows-media' && filteredFlowsMedia.length === 0) ||
        (activeTab === 'digital-twins' && filteredDigitalTwins.length === 0)) && (
        <p className="text-center py-8" style={{ fontSize: '14px', color: '#7F7F7F' }}>No items found</p>
      )}

      {/* Procedure Info Modal */}
      {selectedItem && (
        <AppProcedureInfoModal
          procedure={{
            id: selectedItem.id,
            projectId: projectId || '',
            name: selectedItem.name,
            type: selectedItem.badgeType || 'procedure',
            steps: selectedItem.steps,
            lastUpdated: selectedItem.date || '',
            version: selectedItem.version,
            description: selectedItem.description,
            thumbnail: selectedItem.thumbnail,
            digitalTwinName: selectedItem.digitalTwinName,
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
              <div className="flex items-center justify-end w-full" style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setLoadingDT(null)}
                  className="flex items-center justify-center hover:bg-white/50 transition-colors"
                  style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                >
                  <X style={{ width: '14px', height: '14px', color: '#36415D' }} />
                </button>
              </div>
              <div
                className="w-full flex items-center justify-center"
                style={{ height: '200px', backgroundColor: '#D9DFD4', borderRadius: '8px', marginBottom: '16px' }}
              >
                <Cuboid style={{ width: '64px', height: '64px', color: '#7F9B8E', opacity: 0.6 }} />
              </div>
              <div className="w-full" style={{ marginBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>{loadingDT.name}</h3>
              </div>
              <div className="flex items-center w-full" style={{ marginBottom: '16px', gap: '10px', fontSize: '12px', color: '#7F7F7F' }}>
                <span>Last updated: {loadingDT.date}</span>
                {loadingDT.version && <><span>|</span><span>Version {loadingDT.version}</span></>}
              </div>
              {/* Content creator area - only for roles with edit access */}
              {hasAccess(currentRole, 'projects-edit') && (
                <div
                  className="w-full flex items-center justify-between"
                  style={{ backgroundColor: '#E9E9E9', borderRadius: '25px', padding: '10px 16px', marginBottom: '20px' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Content creator area</span>
                  <button
                    onClick={() => window.open(`/web/project/915-i-series/knowledgebase?open=${loadingDT.id}`, '_blank')}
                    className="hover:underline"
                    style={{ fontSize: '12px', color: '#2F80ED' }}
                  >
                    Settings (external)
                  </button>
                </div>
              )}
              <div className="w-full flex flex-col items-center" style={{ gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semibold)', color: '#36415D' }}>
                  Loading &nbsp;{Math.min(Math.round(loadProgress), 100)} %
                </span>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E9E9E9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(loadProgress, 100)}%`, height: '100%', backgroundColor: '#2F80ED', borderRadius: '3px', transition: 'width 0.15s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
