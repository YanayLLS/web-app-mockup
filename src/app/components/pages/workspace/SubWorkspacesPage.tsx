import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, MoreVertical, Users, Layers, Settings, ChevronLeft,
  Search, X, AlertTriangle, Trash2, ShieldOff, ShieldCheck,
  Calendar, Globe, Mail, Hash, ArrowUpDown, ArrowUp, ArrowDown,
  Copy, Pencil, Ban, RefreshCw, FileText, ChevronRight,
  Check, Lock, TriangleAlert, Network, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { BaseModal } from '../../modals/BaseModal';
import { Checkbox } from './members/Checkbox';

// ─── Data Model ────────────────────────────────────────────────────────────

interface MirroredProject {
  id: string;
  name: string;
}

interface SubWorkspace {
  id: string;
  domainName: string;
  displayName: string;
  owner: string;
  memberCount: number;
  maxUsers: number;
  dateCreated: string;
  expirationDate: string;
  country: string;
  blocked: boolean;
  mirroredProjects: MirroredProject[];
  subDomains: string[];
  // Permissions
  canCreateCustomers: boolean;
  canCallSubDomainUsers: boolean;
  canDeleteSubWorkspace: boolean;
  canMirrorParentProjects: boolean;
  canEditExpirationDate: boolean;
  canAddAiChatKnowledge: boolean;
}

type SortField = 'displayName' | 'dateCreated' | 'expirationDate' | 'memberCount' | 'mirroredProjects';
type SortDir = 'asc' | 'desc';
type View = 'list' | 'settings';
type WizardStep = 0 | 1 | 2;

// ─── All available parent projects (mock) ──────────────────────────────────

const ALL_PARENT_PROJECTS: MirroredProject[] = [
  { id: 'p1', name: 'Jet Engine Assembly Line' },
  { id: 'p2', name: 'Hydraulic Press Maintenance' },
  { id: 'p3', name: 'CNC Machine Setup' },
  { id: 'p4', name: 'Welding Station Safety' },
  { id: 'p5', name: 'Robotic Arm Calibration' },
  { id: 'p6', name: 'Quality Control - Turbine Blades' },
  { id: 'p7', name: 'Electrical Panel Installation' },
  { id: 'p8', name: 'Conveyor Belt Troubleshooting' },
  { id: 'p9', name: 'Paint Booth Operations' },
  { id: 'p10', name: 'Forklift Safety Procedures' },
  { id: 'p11', name: '3D Printer Operations' },
  { id: 'p12', name: 'Laser Cutter Maintenance' },
];

// ─── Mock Data ─────────────────────────────────────────────────────────────

const INITIAL_WORKSPACES: SubWorkspace[] = [
  {
    id: '1',
    domainName: 'acme-engineering',
    displayName: 'ACME Engineering',
    owner: 'john.miller@acme.com',
    memberCount: 24,
    maxUsers: 30,
    dateCreated: '2024-06-15',
    expirationDate: '2026-06-15',
    country: 'United States',
    blocked: false,
    mirroredProjects: [
      { id: 'p1', name: 'Jet Engine Assembly Line' },
      { id: 'p2', name: 'Hydraulic Press Maintenance' },
      { id: 'p5', name: 'Robotic Arm Calibration' },
      { id: 'p6', name: 'Quality Control - Turbine Blades' },
      { id: 'p7', name: 'Electrical Panel Installation' },
    ],
    subDomains: ['acme-eng-west'],
    canCreateCustomers: false,
    canCallSubDomainUsers: true,
    canDeleteSubWorkspace: true,
    canMirrorParentProjects: true,
    canEditExpirationDate: true,
    canAddAiChatKnowledge: false,
  },
  {
    id: '2',
    domainName: 'global-mfg',
    displayName: 'Global Manufacturing',
    owner: 'sara.chen@globalmfg.com',
    memberCount: 52,
    maxUsers: 60,
    dateCreated: '2024-03-10',
    expirationDate: '2025-03-10',
    country: 'Germany',
    blocked: false,
    mirroredProjects: [
      { id: 'p3', name: 'CNC Machine Setup' },
      { id: 'p4', name: 'Welding Station Safety' },
      { id: 'p8', name: 'Conveyor Belt Troubleshooting' },
      { id: 'p9', name: 'Paint Booth Operations' },
      { id: 'p10', name: 'Forklift Safety Procedures' },
      { id: 'p11', name: '3D Printer Operations' },
      { id: 'p12', name: 'Laser Cutter Maintenance' },
    ],
    subDomains: ['global-mfg-eu', 'global-mfg-asia'],
    canCreateCustomers: true,
    canCallSubDomainUsers: false,
    canDeleteSubWorkspace: false,
    canMirrorParentProjects: false,
    canEditExpirationDate: false,
    canAddAiChatKnowledge: false,
  },
  {
    id: '3',
    domainName: 'skyline-ops',
    displayName: 'Skyline Operations',
    owner: 'mark.taylor@skyline.io',
    memberCount: 8,
    maxUsers: 15,
    dateCreated: '2025-01-20',
    expirationDate: '2026-01-20',
    country: 'United Kingdom',
    blocked: true,
    mirroredProjects: [
      { id: 'p1', name: 'Jet Engine Assembly Line' },
      { id: 'p4', name: 'Welding Station Safety' },
    ],
    subDomains: [],
    canCreateCustomers: false,
    canCallSubDomainUsers: true,
    canDeleteSubWorkspace: true,
    canMirrorParentProjects: true,
    canEditExpirationDate: false,
    canAddAiChatKnowledge: true,
  },
  {
    id: '4',
    domainName: 'precision-tools',
    displayName: 'Precision Tools Ltd',
    owner: 'anna.kowalski@prectools.com',
    memberCount: 17,
    maxUsers: 25,
    dateCreated: '2024-09-01',
    expirationDate: '2025-09-01',
    country: 'Poland',
    blocked: false,
    mirroredProjects: [
      { id: 'p3', name: 'CNC Machine Setup' },
      { id: 'p5', name: 'Robotic Arm Calibration' },
      { id: 'p12', name: 'Laser Cutter Maintenance' },
    ],
    subDomains: [],
    canCreateCustomers: false,
    canCallSubDomainUsers: false,
    canDeleteSubWorkspace: true,
    canMirrorParentProjects: true,
    canEditExpirationDate: true,
    canAddAiChatKnowledge: false,
  },
  {
    id: '5',
    domainName: 'apex-ind',
    displayName: 'Apex Industries',
    owner: 'james.wright@apex.com',
    memberCount: 35,
    maxUsers: 40,
    dateCreated: '2024-11-05',
    expirationDate: '2025-11-05',
    country: 'Canada',
    blocked: false,
    mirroredProjects: [
      { id: 'p2', name: 'Hydraulic Press Maintenance' },
      { id: 'p6', name: 'Quality Control - Turbine Blades' },
      { id: 'p7', name: 'Electrical Panel Installation' },
      { id: 'p8', name: 'Conveyor Belt Troubleshooting' },
    ],
    subDomains: ['apex-ind-east'],
    canCreateCustomers: false,
    canCallSubDomainUsers: true,
    canDeleteSubWorkspace: true,
    canMirrorParentProjects: true,
    canEditExpirationDate: true,
    canAddAiChatKnowledge: true,
  },
];

const COUNTRY_LIST = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
  'Australia', 'Japan', 'South Korea', 'Israel', 'Poland',
  'Netherlands', 'Spain', 'Italy', 'Brazil', 'India',
  'China', 'Singapore', 'Sweden', 'Norway', 'Switzerland',
];

const TOTAL_PARENT_SEATS = 200;

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isNearExpiry(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 days
}

function isExpired(dateStr: string) {
  return new Date(dateStr).getTime() < Date.now();
}

function getDefaultExpiration() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidName(name: string) {
  return name.trim().length >= 3 && name.trim().length <= 24;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function SubWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<SubWorkspace[]>(INITIAL_WORKSPACES);
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Wizard modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardEditId, setWizardEditId] = useState<string | null>(null);

  // Delete/Block confirmation
  const [confirmModal, setConfirmModal] = useState<{ type: 'delete' | 'block' | 'activate'; ws: SubWorkspace } | null>(null);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Edit mirrored projects modal (from settings view)
  const [mirrorModalOpen, setMirrorModalOpen] = useState(false);

  const selectedWs = workspaces.find(w => w.id === selectedId) || null;
  const usedSeats = workspaces.reduce((s, w) => s + w.maxUsers, 0);
  const availableSeats = TOTAL_PARENT_SEATS - usedSeats;

  const openSettings = (ws: SubWorkspace) => {
    setSelectedId(ws.id);
    setView('settings');
  };

  const backToList = () => {
    setView('list');
    setSelectedId(null);
  };

  const handleCreate = (ws: SubWorkspace) => {
    setWorkspaces(prev => [...prev, ws]);
    toast.success(`Sub-workspace "${ws.displayName}" created`);
  };

  const handleUpdate = (ws: SubWorkspace) => {
    setWorkspaces(prev => prev.map(w => w.id === ws.id ? ws : w));
    setSelectedId(ws.id);
    toast.success(`Sub-workspace "${ws.displayName}" updated`);
  };

  const handleDelete = (ws: SubWorkspace) => {
    setWorkspaces(prev => prev.filter(w => w.id !== ws.id));
    backToList();
    toast.success(`Sub-workspace "${ws.displayName}" deleted`);
  };

  const handleBlock = (ws: SubWorkspace) => {
    const updated = { ...ws, blocked: !ws.blocked };
    setWorkspaces(prev => prev.map(w => w.id === ws.id ? updated : w));
    setSelectedId(updated.id);
    toast.success(updated.blocked ? `"${ws.displayName}" blocked` : `"${ws.displayName}" activated`);
  };

  const handleUpdateMirroredProjects = (projects: MirroredProject[]) => {
    if (!selectedWs) return;
    const updated = { ...selectedWs, mirroredProjects: projects };
    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
    toast.success(`Mirrored projects updated for "${selectedWs.displayName}"`);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {view === 'list' ? (
        <ListView
          workspaces={workspaces}
          availableSeats={availableSeats}
          onOpenSettings={openSettings}
          onCreateClick={() => { setWizardEditId(null); setWizardOpen(true); }}
          onExportClick={() => setReportModalOpen(true)}
        />
      ) : selectedWs ? (
        <SettingsView
          ws={selectedWs}
          availableSeats={availableSeats}
          onBack={backToList}
          onSave={handleUpdate}
          onDelete={() => setConfirmModal({ type: 'delete', ws: selectedWs })}
          onBlock={() => setConfirmModal({ type: selectedWs.blocked ? 'activate' : 'block', ws: selectedWs })}
          onEditMirroredProjects={() => setMirrorModalOpen(true)}
        />
      ) : null}

      {/* Create/Edit Wizard */}
      {wizardOpen && (
        <CreateEditWizard
          editWs={wizardEditId ? workspaces.find(w => w.id === wizardEditId) || null : null}
          availableSeats={availableSeats}
          allProjects={ALL_PARENT_PROJECTS}
          onClose={() => { setWizardOpen(false); setWizardEditId(null); }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* Confirm Modal (delete/block/activate) */}
      {confirmModal && (
        <ConfirmActionModal
          type={confirmModal.type}
          ws={confirmModal.ws}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === 'delete') handleDelete(confirmModal.ws);
            else handleBlock(confirmModal.ws);
            setConfirmModal(null);
          }}
        />
      )}

      {/* Reports Modal */}
      {reportModalOpen && (
        <ReportSettingsModal onClose={() => setReportModalOpen(false)} />
      )}

      {/* Edit Mirrored Projects Modal (from settings) */}
      {mirrorModalOpen && selectedWs && (
        <ProjectSelectionModal
          allProjects={ALL_PARENT_PROJECTS}
          selectedIds={selectedWs.mirroredProjects.map(p => p.id)}
          onClose={() => setMirrorModalOpen(false)}
          onSave={(ids) => {
            handleUpdateMirroredProjects(ALL_PARENT_PROJECTS.filter(p => ids.includes(p.id)));
            setMirrorModalOpen(false);
          }}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ListView({
  workspaces, availableSeats, onOpenSettings, onCreateClick, onExportClick,
}: {
  workspaces: SubWorkspace[];
  availableSeats: number;
  onOpenSettings: (ws: SubWorkspace) => void;
  onCreateClick: () => void;
  onExportClick: () => void;
}) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('displayName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const totalMembers = workspaces.reduce((s, w) => s + w.memberCount, 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = workspaces;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w => w.displayName.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'displayName': cmp = a.displayName.localeCompare(b.displayName); break;
        case 'dateCreated': cmp = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(); break;
        case 'expirationDate': cmp = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime(); break;
        case 'memberCount': cmp = a.memberCount - b.memberCount; break;
        case 'mirroredProjects': cmp = a.mirroredProjects.length - b.mirroredProjects.length; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [workspaces, search, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-muted/40" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />;
  };

  return (
    <>
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)' }}>
              Sub-Workspaces
            </h1>
            <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
              Manage sub-workspaces, members, and mirrored projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/10">
              <Layers size={13} className="text-primary" />
              <span className="text-[11px] text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {workspaces.length} workspaces · {totalMembers} members · {availableSeats} seats available
              </span>
            </div>
            <button
              onClick={onExportClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Download size={15} />
              <span>Export</span>
            </button>
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Plus size={16} />
              <span>Create Sub-Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search / Filter Bar */}
      <div className="border-b border-border/40 bg-card px-4 sm:px-6 py-3">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground placeholder:text-muted/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={search ? 'No matching workspaces' : 'No sub-workspaces yet'}
            description={search ? 'Try adjusting your search query.' : 'Create your first sub-workspace to organize teams and projects.'}
            action={!search ? { label: 'Create Sub-Workspace', onClick: onCreateClick } : undefined}
          />
        ) : (
          <div className="max-w-6xl">
            {/* Column Headers */}
            <div
              className="grid items-center px-4 py-2 mb-1"
              style={{ gridTemplateColumns: '1fr 120px 120px 150px 120px 50px', gap: '12px' }}
            >
              {([
                ['displayName', 'Workspace'],
                ['dateCreated', 'Created'],
                ['expirationDate', 'Expiration'],
                ['memberCount', 'Members'],
                ['mirroredProjects', 'Mirrored Projects'],
              ] as [SortField, string][]).map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="flex items-center gap-1 text-[10px] text-muted uppercase tracking-wider hover:text-foreground transition-colors"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  {label}
                  <SortIcon field={field} />
                </button>
              ))}
              <span />
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {filtered.map(ws => (
                <div
                  key={ws.id}
                  className="group grid items-center px-4 py-3.5 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all"
                  style={{ gridTemplateColumns: '1fr 120px 120px 150px 120px 50px', gap: '12px' }}
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[11px]"
                      style={{ background: '#2F80ED', fontWeight: 'var(--font-weight-bold)' }}>
                      {ws.displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm truncate" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {ws.displayName}
                        </span>
                        {ws.blocked && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive"
                            style={{ fontWeight: 'var(--font-weight-bold)' }} title="Blocked sub-workspace">
                            <Lock size={9} /> Blocked
                          </span>
                        )}
                        {ws.canCreateCustomers && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary"
                            style={{ fontWeight: 'var(--font-weight-bold)' }} title="Can create sub-workspaces">
                            <Network size={9} /> Channel
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted truncate block">{ws.owner}</span>
                    </div>
                  </div>

                  {/* Created */}
                  <span className="text-xs text-muted">{formatDate(ws.dateCreated)}</span>

                  {/* Expiration */}
                  <div className="flex items-center gap-1.5">
                    {isExpired(ws.expirationDate) && <TriangleAlert size={12} className="text-destructive shrink-0" />}
                    {!isExpired(ws.expirationDate) && isNearExpiry(ws.expirationDate) && <TriangleAlert size={12} className="text-[#F59E0B] shrink-0" />}
                    <span className={`text-xs ${isExpired(ws.expirationDate) ? 'text-destructive' : isNearExpiry(ws.expirationDate) ? 'text-[#F59E0B]' : 'text-muted'}`}
                      style={isExpired(ws.expirationDate) || isNearExpiry(ws.expirationDate) ? { fontWeight: 'var(--font-weight-semibold)' } : undefined}>
                      {formatDate(ws.expirationDate)}
                    </span>
                  </div>

                  {/* Members */}
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-muted/50" />
                    <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      {ws.memberCount}
                    </span>
                    <span className="text-[10px] text-muted">/ {ws.maxUsers}</span>
                  </div>

                  {/* Mirrored Projects */}
                  <div className="flex items-center gap-1.5">
                    <Copy size={12} className="text-muted/50" style={{ transform: 'scaleX(-1)' }} />
                    <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      {ws.mirroredProjects.length}
                    </span>
                    <span className="text-[10px] text-muted">projects</span>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onOpenSettings(ws)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors md:opacity-0 md:group-hover:opacity-100"
                    title="Settings"
                  >
                    <Settings size={15} className="text-muted" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS VIEW
// ═══════════════════════════════════════════════════════════════════════════

function SettingsView({
  ws, availableSeats, onBack, onSave, onDelete, onBlock, onEditMirroredProjects,
}: {
  ws: SubWorkspace;
  availableSeats: number;
  onBack: () => void;
  onSave: (updated: SubWorkspace) => void;
  onDelete: () => void;
  onBlock: () => void;
  onEditMirroredProjects: () => void;
}) {
  const [draft, setDraft] = useState<SubWorkspace>({ ...ws });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(ws.displayName);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset draft when ws changes (e.g., after mirrored projects update)
  useEffect(() => {
    setDraft({ ...ws });
    setNameInput(ws.displayName);
  }, [ws]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(ws);

  const updateDraft = (partial: Partial<SubWorkspace>) => setDraft(prev => ({ ...prev, ...partial }));

  const handleSaveName = () => {
    if (isValidName(nameInput)) {
      updateDraft({ displayName: nameInput.trim() });
    } else {
      setNameInput(draft.displayName);
    }
    setEditingName(false);
  };

  useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const validationErrors: string[] = [];
  if (!isValidName(draft.displayName)) validationErrors.push('Name must be 3–24 characters.');
  if (!isValidEmail(draft.owner)) validationErrors.push('Invalid owner email.');
  if (draft.maxUsers < 1 || draft.maxUsers > (ws.maxUsers + availableSeats)) validationErrors.push('Max users out of range.');

  return (
    <>
      {/* Header Bar */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Back to list">
            <ChevronLeft size={18} className="text-muted" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameRef}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setNameInput(draft.displayName); setEditingName(false); } }}
                  className="px-2 py-1 border border-primary bg-card rounded-lg outline-none text-foreground focus:ring-2 focus:ring-primary/10"
                  style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}
                  maxLength={24}
                />
                <span className="text-[10px] text-muted">{nameInput.length}/24</span>
              </div>
            ) : (
              <>
                <h2 className="text-foreground truncate" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
                  {draft.displayName}
                </h2>
                <button onClick={() => setEditingName(true)} className="p-1 rounded hover:bg-secondary transition-colors shrink-0">
                  <Pencil size={13} className="text-muted" />
                </button>
              </>
            )}
            {ws.blocked && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive"
                style={{ fontWeight: 'var(--font-weight-bold)' }}>
                <Lock size={10} /> Blocked
              </span>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 pl-9 text-xs text-muted">
          <span className="flex items-center gap-1.5"><Users size={13} /> <strong className="text-foreground">{ws.memberCount}</strong> Members</span>
          <span className="w-px h-3 bg-border/60" />
          <span className="flex items-center gap-1.5"><Copy size={13} style={{ transform: 'scaleX(-1)' }} /> <strong className="text-foreground">{ws.mirroredProjects.length}</strong> Mirrored Projects</span>
          <span className="w-px h-3 bg-border/60" />
          <span className="flex items-center gap-1.5"><Network size={13} /> <strong className="text-foreground">{ws.subDomains.length}</strong> Sub-workspaces</span>
          <span className="w-px h-3 bg-border/60" />
          <span className="flex items-center gap-1.5"><Calendar size={13} /> Created {formatDate(ws.dateCreated)}</span>
          <span className="w-px h-3 bg-border/60" />
          <span className={`flex items-center gap-1.5 ${isExpired(ws.expirationDate) ? 'text-destructive' : isNearExpiry(ws.expirationDate) ? 'text-[#F59E0B]' : ''}`}>
            <Calendar size={13} /> Expires {formatDate(ws.expirationDate)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar">
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">
          {/* Left Column (65%) */}
          <div className="flex-1 space-y-6 min-w-0" style={{ flex: '0 0 65%' }}>
            {/* General Settings */}
            <SettingsSection title="General Settings" icon={<Settings size={16} />}>
              <SettingsField label="Workspace Name" icon={<Hash size={14} />}>
                <input
                  value={draft.displayName}
                  onChange={e => updateDraft({ displayName: e.target.value })}
                  maxLength={24}
                  className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                  placeholder="3–24 characters"
                />
                <span className="text-[10px] text-muted mt-1">{draft.displayName.length}/24 characters</span>
              </SettingsField>

              <SettingsField label="Owner Email" icon={<Mail size={14} />}>
                <input
                  value={draft.owner}
                  onChange={e => updateDraft({ owner: e.target.value.toLowerCase() })}
                  type="email"
                  className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                  placeholder="owner@company.com"
                />
                {draft.owner !== ws.owner && draft.owner && (
                  <span className="text-[10px] text-[#F59E0B] mt-1">Changing owner will send an invitation email to the new owner.</span>
                )}
              </SettingsField>

              <SettingsField label="Expiration Date" icon={<Calendar size={14} />}>
                <input
                  type="date"
                  value={draft.expirationDate}
                  onChange={e => updateDraft({ expirationDate: e.target.value })}
                  min={getTomorrow()}
                  className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                />
              </SettingsField>

              <SettingsField label="Country" icon={<Globe size={14} />}>
                <select
                  value={draft.country}
                  onChange={e => updateDraft({ country: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                >
                  {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </SettingsField>

              <SettingsField label="Max Users" icon={<Users size={14} />}>
                <input
                  type="number"
                  value={draft.maxUsers}
                  onChange={e => updateDraft({ maxUsers: Math.max(1, parseInt(e.target.value) || 1) })}
                  min={1}
                  max={ws.maxUsers + availableSeats}
                  className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                />
                <span className="text-[10px] text-muted mt-1">{availableSeats + ws.maxUsers - draft.maxUsers} seats remaining in parent workspace</span>
              </SettingsField>
            </SettingsSection>

            {/* Permissions */}
            <SettingsSection title="Permissions" icon={<ShieldCheck size={16} />}>
              <div className="space-y-3">
                <PermissionRow
                  label="Can create sub-workspaces"
                  description="Allow this sub-workspace to create its own sub-workspaces (channel mode)"
                  checked={draft.canCreateCustomers}
                  onChange={v => updateDraft({
                    canCreateCustomers: v,
                    ...(v ? { canCallSubDomainUsers: false, canDeleteSubWorkspace: false, canMirrorParentProjects: false, canEditExpirationDate: false } : {}),
                  })}
                />
                <PermissionRow
                  label="Can call members via Remote Support"
                  description="Allow remote support calls to sub-workspace members"
                  checked={draft.canCallSubDomainUsers}
                  onChange={v => updateDraft({ canCallSubDomainUsers: v })}
                  disabled={draft.canCreateCustomers}
                />
                <PermissionRow
                  label="Can delete sub-workspaces"
                  description="Allow deletion of the sub-workspace"
                  checked={draft.canDeleteSubWorkspace}
                  onChange={v => updateDraft({ canDeleteSubWorkspace: v })}
                  disabled={draft.canCreateCustomers}
                />
                <PermissionRow
                  label="Can mirror parent projects"
                  description="Allow mirroring projects from the parent workspace"
                  checked={draft.canMirrorParentProjects}
                  onChange={v => updateDraft({ canMirrorParentProjects: v })}
                  disabled={draft.canCreateCustomers}
                />
                <PermissionRow
                  label="Can edit expiration date"
                  description="Allow editing the sub-workspace expiration date"
                  checked={draft.canEditExpirationDate}
                  onChange={v => updateDraft({ canEditExpirationDate: v })}
                  disabled={draft.canCreateCustomers}
                />
                <PermissionRow
                  label="Can add AI chat knowledge"
                  description="Allow adding content to AI knowledge base"
                  checked={draft.canAddAiChatKnowledge}
                  onChange={v => updateDraft({ canAddAiChatKnowledge: v })}
                />
              </div>
            </SettingsSection>

            {/* Danger Zone */}
            <SettingsSection title="Danger Zone" icon={<AlertTriangle size={16} />} danger>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                  <div>
                    <p className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      {ws.blocked ? 'Activate Workspace' : 'Block Workspace'}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {ws.blocked ? 'Re-enable access for all members.' : 'Prevent all members from accessing this sub-workspace.'}
                    </p>
                  </div>
                  <button
                    onClick={onBlock}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all ${
                      ws.blocked
                        ? 'bg-primary text-primary-foreground hover:brightness-110'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20'
                    }`}
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {ws.blocked ? <><RefreshCw size={13} /> Activate</> : <><Ban size={13} /> Block</>}
                  </button>
                </div>

                {ws.canDeleteSubWorkspace && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div>
                      <p className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        Delete Workspace
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        Permanently delete this sub-workspace. This cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={onDelete}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-destructive text-white hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all"
                      style={{ fontWeight: 'var(--font-weight-bold)' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </SettingsSection>
          </div>

          {/* Right Column (35%) — Mirrored Projects */}
          <div style={{ flex: '0 0 33%' }}>
            <SettingsSection
              title="Mirrored Projects"
              icon={<Copy size={16} style={{ transform: 'scaleX(-1)' }} />}
              action={<button onClick={onEditMirroredProjects} className="text-[10px] text-primary hover:underline" style={{ fontWeight: 'var(--font-weight-bold)' }}>Edit</button>}
            >
              <p className="text-[10px] text-muted mb-3 leading-relaxed">
                Mirrored projects can be viewed in this sub-workspace, but cannot be edited.
              </p>
              {ws.mirroredProjects.length === 0 ? (
                <div className="py-6 text-center">
                  <Copy size={24} className="text-muted/30 mx-auto mb-2" style={{ transform: 'scaleX(-1)' }} />
                  <p className="text-[10px] text-muted">No mirrored projects</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ws.mirroredProjects.map(p => (
                    <div key={p.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary/30 border border-border/60">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10 text-primary text-[9px] shrink-0"
                        style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs text-foreground truncate" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SettingsSection>
          </div>
        </div>
      </div>

      {/* Save/Discard Footer */}
      {hasChanges && (
        <div className="border-t border-border/60 bg-card px-4 sm:px-6 py-3 flex items-center justify-end gap-3">
          {validationErrors.length > 0 && (
            <span className="text-[10px] text-destructive mr-auto">{validationErrors[0]}</span>
          )}
          <button
            onClick={() => { setDraft({ ...ws }); setNameInput(ws.displayName); }}
            className="px-4 py-2.5 bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all text-xs"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Discard
          </button>
          <button
            onClick={() => {
              if (validationErrors.length > 0) { toast.error(validationErrors[0]); return; }
              onSave(draft);
            }}
            disabled={validationErrors.length > 0}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Save Changes
          </button>
        </div>
      )}
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// CREATE/EDIT WIZARD (3-Step Modal)
// ═══════════════════════════════════════════════════════════════════════════

function CreateEditWizard({
  editWs, availableSeats, allProjects, onClose, onCreate, onUpdate,
}: {
  editWs: SubWorkspace | null;
  availableSeats: number;
  allProjects: MirroredProject[];
  onClose: () => void;
  onCreate: (ws: SubWorkspace) => void;
  onUpdate: (ws: SubWorkspace) => void;
}) {
  const isEdit = !!editWs;
  const [step, setStep] = useState<WizardStep>(0);

  // Step 0: Settings
  const [name, setName] = useState(editWs?.displayName || '');
  const [owner, setOwner] = useState(editWs?.owner || '');
  const [expiration, setExpiration] = useState(editWs?.expirationDate || getDefaultExpiration());
  const [country, setCountry] = useState(editWs?.country || 'United States');
  const [maxUsers, setMaxUsers] = useState(editWs?.maxUsers || 10);

  // Step 1: Permissions
  const [canCreateCustomers, setCanCreateCustomers] = useState(editWs?.canCreateCustomers || false);
  const [canCall, setCanCall] = useState(editWs?.canCallSubDomainUsers || false);
  const [canDelete, setCanDelete] = useState(editWs?.canDeleteSubWorkspace || true);
  const [canMirror, setCanMirror] = useState(editWs?.canMirrorParentProjects || true);
  const [canEditExp, setCanEditExp] = useState(editWs?.canEditExpirationDate || true);
  const [canAi, setCanAi] = useState(editWs?.canAddAiChatKnowledge || false);

  // Step 2: Projects
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(
    new Set(editWs?.mirroredProjects.map(p => p.id) || [])
  );

  const maxAllowed = (editWs?.maxUsers || 0) + availableSeats;

  // Validation per step
  const step0Valid = isValidName(name) && isValidEmail(owner) && maxUsers >= 1 && maxUsers <= maxAllowed;
  const step2Valid = isEdit || selectedProjectIds.size > 0;

  const handleConfirm = () => {
    const wsData: SubWorkspace = {
      id: editWs?.id || `ws-${Date.now()}`,
      domainName: editWs?.domainName || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      displayName: name.trim(),
      owner: owner.toLowerCase(),
      memberCount: editWs?.memberCount || 0,
      maxUsers,
      dateCreated: editWs?.dateCreated || new Date().toISOString().split('T')[0],
      expirationDate: expiration,
      country,
      blocked: editWs?.blocked || false,
      mirroredProjects: allProjects.filter(p => selectedProjectIds.has(p.id)),
      subDomains: editWs?.subDomains || [],
      canCreateCustomers,
      canCallSubDomainUsers: canCreateCustomers ? false : canCall,
      canDeleteSubWorkspace: canCreateCustomers ? false : canDelete,
      canMirrorParentProjects: canCreateCustomers ? false : canMirror,
      canEditExpirationDate: canCreateCustomers ? false : canEditExp,
      canAddAiChatKnowledge: canAi,
    };
    if (isEdit) onUpdate(wsData);
    else onCreate(wsData);
    onClose();
  };

  return (
    <BaseModal isOpen onClose={onClose} opacity={60} blur>
      <div className="bg-card rounded-xl w-[540px] max-w-[calc(100vw-32px)] border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/60">
          <h3 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
            {isEdit ? 'Edit Sub-Workspace' : 'Create Sub-Workspace'}
          </h3>
          <p className="text-[11px] text-muted mt-1">
            {isEdit ? 'Update the sub-workspace settings, permissions, and projects.' : 'Set up a new sub-workspace with settings, permissions, and projects.'}
          </p>
        </div>

        {/* Stepper */}
        <div className="px-6 py-3 border-b border-border/40 flex items-center gap-2">
          {(['Settings', 'Permissions', 'Projects'] as const).map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={12} className="text-muted/40" />}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] transition-all ${
                i === step ? 'bg-primary/10 text-primary' : i < step ? 'text-primary/60' : 'text-muted/50'
              }`} style={{ fontWeight: i === step ? 'var(--font-weight-bold)' : 'var(--font-weight-semibold)' }}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                  i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-secondary text-muted'
                }`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {i < step ? <Check size={10} /> : i + 1}
                </span>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="px-6 py-5 max-h-[400px] overflow-y-auto custom-scrollbar">
          {step === 0 && (
            <div className="space-y-4">
              <WizardField label="Workspace Name" error={name.length > 0 && !isValidName(name) ? '3–24 characters required' : undefined}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Enter workspace name"
                  className="w-full px-3 py-2.5 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground placeholder:text-muted/50"
                  autoFocus
                />
                <span className="text-[10px] text-muted">{name.length}/24</span>
              </WizardField>

              <WizardField label="Owner Email" error={owner.length > 0 && !isValidEmail(owner) ? 'Invalid email format' : undefined}>
                <input
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                  type="email"
                  placeholder="owner@company.com"
                  className="w-full px-3 py-2.5 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground placeholder:text-muted/50"
                />
              </WizardField>

              <WizardField label="Expiration Date">
                <input
                  type="date"
                  value={expiration}
                  onChange={e => setExpiration(e.target.value)}
                  min={getTomorrow()}
                  className="w-full px-3 py-2.5 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                />
              </WizardField>

              <WizardField label="Country">
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                >
                  {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </WizardField>

              <WizardField label="Max Users" error={maxUsers > maxAllowed ? `Max ${maxAllowed} seats available` : maxUsers < 1 ? 'At least 1 user required' : undefined}>
                <input
                  type="number"
                  value={maxUsers}
                  onChange={e => setMaxUsers(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={maxAllowed}
                  className="w-full px-3 py-2.5 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground"
                />
                <span className="text-[10px] text-muted">{maxAllowed - maxUsers} seats remaining</span>
              </WizardField>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted mb-4 leading-relaxed">
                Control what this sub-workspace can do. These permissions are set by the parent workspace.
              </p>
              <PermissionRow
                label="Can create sub-workspaces"
                description="Enable channel mode — allows creating nested sub-workspaces"
                checked={canCreateCustomers}
                onChange={v => {
                  setCanCreateCustomers(v);
                  if (v) { setCanCall(false); setCanDelete(false); setCanMirror(false); setCanEditExp(false); }
                }}
              />
              <PermissionRow label="Can call members via Remote Support" description="Allow remote support calls" checked={canCall} onChange={setCanCall} disabled={canCreateCustomers} />
              <PermissionRow label="Can delete sub-workspaces" description="Allow deletion" checked={canDelete} onChange={setCanDelete} disabled={canCreateCustomers} />
              <PermissionRow label="Can mirror parent projects" description="Allow project mirroring" checked={canMirror} onChange={setCanMirror} disabled={canCreateCustomers} />
              <PermissionRow label="Can edit expiration date" description="Allow expiration editing" checked={canEditExp} onChange={setCanEditExp} disabled={canCreateCustomers} />
              <PermissionRow label="Can add AI chat knowledge" description="Allow AI knowledge base content" checked={canAi} onChange={setCanAi} />
            </div>
          )}

          {step === 2 && (
            <ProjectSelectionInline
              allProjects={allProjects}
              selectedIds={selectedProjectIds}
              onChange={setSelectedProjectIds}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60">
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep((step - 1) as WizardStep)}
                className="px-4 py-2.5 text-xs bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-muted hover:text-foreground transition-colors"
              style={{ fontWeight: 'var(--font-weight-semibold)' }}
            >
              Cancel
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep((step + 1) as WizardStep)}
                disabled={step === 0 && !step0Valid}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!step2Valid}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                {isEdit ? 'Update' : 'Create'}
              </button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// PROJECT SELECTION (Inline for wizard + standalone modal)
// ═══════════════════════════════════════════════════════════════════════════

function ProjectSelectionInline({
  allProjects, selectedIds, onChange,
}: {
  allProjects: MirroredProject[];
  selectedIds: Set<string>;
  onChange: (ids: Set<string>) => void;
}) {
  const [search, setSearch] = useState('');
  const lastClickedRef = useRef<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return allProjects;
    const q = search.toLowerCase();
    if (q.length === 1) {
      return allProjects.filter(p => p.name.toLowerCase().startsWith(q));
    }
    const regex = new RegExp(`(\\s|\\-|_|/|^)${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return allProjects.filter(p => regex.test(p.name));
  }, [allProjects, search]);

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      filtered.forEach(p => next.delete(p.id));
    } else {
      filtered.forEach(p => next.add(p.id));
    }
    onChange(next);
  };

  const toggleProject = (index: number, shiftKey: boolean) => {
    const next = new Set(selectedIds);
    const project = filtered[index];

    if (shiftKey && lastClickedRef.current !== null) {
      const start = Math.min(lastClickedRef.current, index);
      const end = Math.max(lastClickedRef.current, index);
      const shouldSelect = !selectedIds.has(project.id);
      for (let i = start; i <= end; i++) {
        if (shouldSelect) next.add(filtered[i].id);
        else next.delete(filtered[i].id);
      }
    } else {
      if (next.has(project.id)) next.delete(project.id);
      else next.add(project.id);
    }
    lastClickedRef.current = index;
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-muted">
          {selectedIds.size} of {allProjects.length} projects selected
        </p>
        <button onClick={toggleAll} className="text-[10px] text-primary hover:underline" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          {allSelected ? 'Unselect all' : 'Select all'}
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-8 pr-8 py-2 text-xs bg-secondary/30 border border-border rounded-lg focus:border-primary focus:bg-card outline-none transition-all text-foreground placeholder:text-muted/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-foreground">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="max-h-[280px] overflow-y-auto custom-scrollbar space-y-1">
        {filtered.length === 0 ? (
          <p className="text-[10px] text-muted text-center py-6">No projects match your search.</p>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={e => toggleProject(i, e.shiftKey)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                selectedIds.has(p.id) ? 'bg-primary/5 border border-primary/15' : 'bg-secondary/20 border border-transparent hover:border-border'
              }`}
            >
              <Checkbox checked={selectedIds.has(p.id)} onChange={() => {}} />
              <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10 text-primary text-[9px] shrink-0"
                style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {p.name.charAt(0)}
              </div>
              <span className="text-xs text-foreground" style={{ fontWeight: selectedIds.has(p.id) ? 'var(--font-weight-semibold)' : undefined }}>
                {p.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function ProjectSelectionModal({
  allProjects, selectedIds: initialIds, onClose, onSave,
}: {
  allProjects: MirroredProject[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}) {
  const [ids, setIds] = useState<Set<string>>(new Set(initialIds));

  return (
    <BaseModal isOpen onClose={onClose} opacity={60} blur>
      <div className="bg-card rounded-xl w-[480px] max-w-[calc(100vw-32px)] border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
        <div className="px-6 py-5 border-b border-border/60">
          <h3 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
            Edit Mirrored Projects
          </h3>
          <p className="text-[11px] text-muted mt-1">Select which projects to mirror into this sub-workspace.</p>
        </div>
        <div className="px-6 py-5">
          <ProjectSelectionInline allProjects={allProjects} selectedIds={ids} onChange={setIds} />
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
          <button onClick={onClose} className="px-4 py-2.5 text-xs text-muted hover:text-foreground transition-colors" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(Array.from(ids))}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all text-xs"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Save
          </button>
        </div>
      </div>
    </BaseModal>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// CONFIRM ACTION MODAL (Delete / Block / Activate)
// ═══════════════════════════════════════════════════════════════════════════

function ConfirmActionModal({
  type, ws, onClose, onConfirm,
}: {
  type: 'delete' | 'block' | 'activate';
  ws: SubWorkspace;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const config = {
    delete: {
      icon: <Trash2 size={20} className="text-destructive" />,
      iconBg: 'bg-destructive/10',
      title: `Delete "${ws.displayName}"`,
      description: 'This action cannot be undone. All members will lose access immediately.',
      detail: `${ws.memberCount} members and ${ws.mirroredProjects.length} mirrored projects will be removed.`,
      confirmLabel: 'Delete Workspace',
      confirmClass: 'bg-destructive text-white hover:brightness-110 hover:shadow-md hover:shadow-destructive/20',
    },
    block: {
      icon: <Ban size={20} className="text-[#F59E0B]" />,
      iconBg: 'bg-[#F59E0B]/10',
      title: `Block "${ws.displayName}"`,
      description: 'All members will be prevented from accessing this sub-workspace.',
      detail: `${ws.memberCount} members will be affected.`,
      confirmLabel: 'Block Workspace',
      confirmClass: 'bg-[#F59E0B] text-white hover:brightness-110',
    },
    activate: {
      icon: <RefreshCw size={20} className="text-primary" />,
      iconBg: 'bg-primary/10',
      title: `Activate "${ws.displayName}"`,
      description: 'Members will regain access to this sub-workspace.',
      detail: `${ws.memberCount} members will be re-enabled.`,
      confirmLabel: 'Activate Workspace',
      confirmClass: 'bg-primary text-primary-foreground hover:brightness-110 hover:shadow-md hover:shadow-primary/20',
    },
  }[type];

  return (
    <BaseModal isOpen onClose={onClose} opacity={70}>
      <div role="alertdialog" aria-modal="true" className="bg-card rounded-xl w-[420px] max-w-[calc(100vw-32px)] border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                {config.title}
              </h3>
              <p className="text-[11px] text-muted mt-0.5">{config.description}</p>
            </div>
          </div>
          <div className="rounded-xl px-4 py-3 mt-4 bg-secondary/50 border border-border/60">
            <p className="text-xs text-foreground/80">{config.detail}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
          <button onClick={onClose}
            className="px-4 py-2.5 min-h-[40px] bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all text-xs"
            style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`px-5 py-2.5 min-h-[40px] rounded-lg transition-all text-xs flex items-center gap-2 ${config.confirmClass}`}
            style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// REPORT SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════

const WORKSPACE_REPORT_FIELDS = [
  'Workspace Name', 'Owner', 'Members Count', 'Max Users', 'Creation Date',
  'Expiration Date', 'Country', 'Mirrored Projects', 'Status', 'Sub-workspaces',
];

const MEMBER_REPORT_FIELDS = [
  'Full Name', 'Email', 'Role', 'Last Login', 'Status',
  'Groups', 'Projects Access', 'Country', 'Created Date',
];

function ReportSettingsModal({ onClose }: { onClose: () => void }) {
  const [wsFields, setWsFields] = useState<Set<string>>(new Set(['Workspace Name', 'Owner', 'Members Count', 'Status']));
  const [memberFields, setMemberFields] = useState<Set<string>>(new Set(['Full Name', 'Email', 'Role', 'Status']));
  const [automate, setAutomate] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const toggleField = (set: Set<string>, setter: (s: Set<string>) => void, field: string) => {
    const next = new Set(set);
    if (next.has(field)) next.delete(field);
    else next.add(field);
    setter(next);
  };

  const canExport = wsFields.size > 0 || memberFields.size > 0;

  return (
    <BaseModal isOpen onClose={onClose} opacity={60} blur>
      <div className="bg-card rounded-xl w-[540px] max-w-[calc(100vw-32px)] border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
        <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              Report Settings
            </h3>
            <p className="text-[11px] text-muted mt-1">Configure which fields to include in exported reports.</p>
          </div>
          <button
            onClick={() => { if (canExport) { toast.success('Report exported'); onClose(); } else { toast.error('Select at least one field'); } }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all text-xs"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <Download size={13} /> Export
          </button>
        </div>

        <div className="px-6 py-5 max-h-[450px] overflow-y-auto custom-scrollbar space-y-5">
          {/* Automate */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/60">
            <div>
              <p className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Automate Reporting</p>
              <p className="text-[10px] text-muted mt-0.5">Automatically generate and send reports on a schedule.</p>
            </div>
            <Checkbox checked={automate} onChange={() => setAutomate(!automate)} />
          </div>

          {automate && (
            <div className="flex items-center gap-3 px-3">
              <span className="text-[10px] text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Frequency:</span>
              {(['daily', 'weekly', 'monthly'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] transition-all ${
                    frequency === f ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary/30 text-muted border border-transparent hover:border-border'
                  }`}
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Workspace Fields */}
          <div>
            <p className="text-xs text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Report Fields (Workspaces)
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {WORKSPACE_REPORT_FIELDS.map(f => (
                <div
                  key={f}
                  onClick={() => toggleField(wsFields, setWsFields, f)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                    wsFields.has(f) ? 'bg-primary/5 border border-primary/15' : 'bg-secondary/20 border border-transparent hover:border-border'
                  }`}
                >
                  <Checkbox checked={wsFields.has(f)} onChange={() => {}} />
                  <span style={{ fontWeight: wsFields.has(f) ? 'var(--font-weight-semibold)' : undefined }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Fields */}
          <div>
            <p className="text-xs text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Report Fields (Members)
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {MEMBER_REPORT_FIELDS.map(f => (
                <div
                  key={f}
                  onClick={() => toggleField(memberFields, setMemberFields, f)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                    memberFields.has(f) ? 'bg-primary/5 border border-primary/15' : 'bg-secondary/20 border border-transparent hover:border-border'
                  }`}
                >
                  <Checkbox checked={memberFields.has(f)} onChange={() => {}} />
                  <span style={{ fontWeight: memberFields.has(f) ? 'var(--font-weight-semibold)' : undefined }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-border/60">
          <button onClick={onClose} className="px-4 py-2.5 text-xs text-muted hover:text-foreground transition-colors" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            Close
          </button>
        </div>
      </div>
    </BaseModal>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(47,128,237,0.08), rgba(47,128,237,0.03))',
          border: '1px solid rgba(47,128,237,0.1)',
          boxShadow: '0 8px 32px rgba(47,128,237,0.06)',
        }}>
        <Icon size={28} className="text-primary/40" />
      </div>
      <h3 className="mb-2 text-[15px]" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-bold)' }}>
        {title}
      </h3>
      <p className="text-center max-w-[280px] leading-relaxed" style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
        {description}
      </p>
      {action && (
        <button onClick={action.onClick}
          className="mt-6 px-6 py-2.5 rounded-lg transition-all hover:brightness-110 hover:shadow-md flex items-center gap-2"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            boxShadow: '0 2px 8px rgba(47,128,237,0.15)',
          }}>
          <Plus size={14} />
          {action.label}
        </button>
      )}
    </div>
  );
}


function SettingsSection({
  title, icon, danger, action, children,
}: {
  title: string;
  icon: React.ReactNode;
  danger?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-5 ${danger ? 'border-destructive/20 bg-destructive/[0.02]' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={danger ? 'text-destructive' : 'text-muted'}>{icon}</span>
          <h4 className={`text-sm ${danger ? 'text-destructive' : 'text-foreground'}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {title}
          </h4>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}


function SettingsField({
  label, icon, children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="flex items-center gap-1.5 text-[10px] text-muted mb-1.5 uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        {icon && <span className="text-muted/60">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}


function PermissionRow({
  label, description, checked, onChange, disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed bg-secondary/10 border-border/40' :
        checked ? 'bg-primary/5 border-primary/15 cursor-pointer' : 'bg-secondary/20 border-transparent hover:border-border cursor-pointer'
      }`}
    >
      <div className="min-w-0 mr-3">
        <p className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{label}</p>
        <p className="text-[10px] text-muted mt-0.5">{description}</p>
      </div>
      <Checkbox checked={checked} onChange={() => {}} disabled={disabled} />
    </div>
  );
}


function WizardField({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] text-muted mb-1.5 block uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        {label}
      </label>
      {children}
      {error && <span className="text-[10px] text-destructive mt-1 block">{error}</span>}
    </div>
  );
}
