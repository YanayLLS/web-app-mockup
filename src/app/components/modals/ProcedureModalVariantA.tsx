import { useState } from 'react';
import {
  X,
  FileText,
  Play,
  Box,
  Clock,
  User,
  Calendar,
  Settings,
  ChevronDown,
  ExternalLink,
  Share2,
  Star,
  Check,
} from 'lucide-react';

interface ProcedureModalVariantAProps {
  procedure: {
    id: string;
    name: string;
    description?: string;
    connectedDigitalTwinIds?: string[];
    digitalTwinId?: string;
    thumbnail?: string;
    isPublished: boolean;
    hasUnpublishedChanges: boolean;
    publishedVersion?: string;
    publishedDate?: string;
    createdBy: string;
    createdDate: string;
    lastEditedBy: string;
    lastEdited: string;
  };
  onClose: () => void;
}

type TabId = 'overview' | 'preview' | 'settings' | 'history';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'preview', label: 'Preview' },
  { id: 'settings', label: 'Settings' },
  { id: 'history', label: 'History' },
];

const mockSettings = {
  textToSpeech: [
    { id: 'auto-narrate-header', label: 'Auto narrate header', checked: true },
    { id: 'auto-narrate-description', label: 'Auto narrate description', checked: true },
    { id: 'wait-for-completion', label: 'Wait for TTS completion before next step', checked: true },
  ],
  logics: [
    { id: 'allow-2d', label: 'Allow 2D viewing', checked: true },
    { id: 'toggle-step', label: 'Toggle step advancement on option selection', checked: true },
    { id: 'allow-skipping', label: 'Allow skipping steps', checked: false },
    { id: 'show-survey', label: 'Show survey', checked: true },
  ],
};

const mockHistory = [
  { version: '1.2', date: 'Mar 18, 2026 at 3:12 PM', by: 'Laura Green', initials: 'LG', color: '#aa74b5', note: 'Updated step descriptions' },
  { version: '1.1', date: 'Mar 10, 2026 at 11:05 AM', by: 'David Kim', initials: 'DK', color: '#2F80ED', note: 'Added new safety check step' },
  { version: '1.0', date: 'Feb 28, 2026 at 9:30 AM', by: 'Laura Green', initials: 'LG', color: '#aa74b5', note: 'Initial publish' },
  { version: '0.9', date: 'Feb 20, 2026 at 4:45 PM', by: 'David Kim', initials: 'DK', color: '#2F80ED', note: 'Draft — added animations' },
  { version: '0.5', date: 'Feb 12, 2026 at 2:00 PM', by: 'Laura Green', initials: 'LG', color: '#aa74b5', note: 'Draft — initial structure' },
];

export function ProcedureModalVariantA({ procedure, onClose }: ProcedureModalVariantAProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isStarred, setIsStarred] = useState(false);
  const [settingsState, setSettingsState] = useState(mockSettings);
  const [selectedDT, setSelectedDT] = useState('Generator Digital Twin');
  const [showDTDropdown, setShowDTDropdown] = useState(false);

  const toggleSetting = (section: 'textToSpeech' | 'logics', id: string) => {
    setSettingsState(prev => ({
      ...prev,
      [section]: prev[section].map(s => s.id === id ? { ...s, checked: !s.checked } : s),
    }));
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-xl w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 900,
          maxHeight: 'calc(100vh - 64px)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: '#E9E9E9' }}
        >
          {/* Left: icon + title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#D9E0F0' }}
            >
              <FileText size={16} style={{ color: '#2F80ED' }} />
            </div>
            <h2
              className="text-base truncate"
              style={{ color: '#36415D', fontWeight: 600 }}
            >
              {procedure.name}
            </h2>
          </div>

          {/* Right: status + share + star + close */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {procedure.isPublished ? (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(17, 232, 116, 0.12)',
                  color: '#0B9E4D',
                  fontWeight: 600,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#11E874' }}
                />
                Published v{procedure.publishedVersion}
              </span>
            ) : (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: '#F5F5F5',
                  color: '#7F7F7F',
                  fontWeight: 600,
                }}
              >
                Draft
              </span>
            )}

            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#868D9E' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Share"
            >
              <Share2 size={18} />
            </button>

            <button
              onClick={() => setIsStarred(!isStarred)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: isStarred ? '#F5A623' : '#868D9E' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={18} fill={isStarred ? '#F5A623' : 'none'} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#868D9E' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Tab Bar ─── */}
        <div
          className="flex px-5 gap-1 border-b shrink-0"
          style={{ borderColor: '#E9E9E9' }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-2.5 text-sm transition-colors"
                style={{
                  color: isActive ? '#2F80ED' : '#868D9E',
                  fontWeight: isActive ? 600 : 500,
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = '#36415D';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = '#868D9E';
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ backgroundColor: '#2F80ED' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─── */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#F5F5F5' }}>
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <div className="p-5">
              <div
                className="bg-white rounded-lg border p-5"
                style={{ borderColor: '#E9E9E9' }}
              >
                {/* Top row: thumbnail + meta */}
                <div className="flex gap-4 mb-5">
                  {/* Thumbnail */}
                  <div
                    className="w-[140px] h-[90px] rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #E9E9E9',
                    }}
                  >
                    {procedure.thumbnail ? (
                      <img
                        src={procedure.thumbnail}
                        alt={procedure.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <FileText size={28} style={{ color: '#C2C9DB' }} />
                        <span className="text-[10px]" style={{ color: '#C2C9DB' }}>
                          No preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg mb-1 truncate"
                      style={{ color: '#36415D', fontWeight: 600 }}
                    >
                      {procedure.name}
                    </h3>
                    <p
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: '#868D9E' }}
                    >
                      {procedure.description || 'No description provided.'}
                    </p>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {procedure.isPublished && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'rgba(17, 232, 116, 0.1)',
                            color: '#0B9E4D',
                            fontWeight: 600,
                          }}
                        >
                          <Check size={12} />
                          v{procedure.publishedVersion}
                        </span>
                      )}
                      {procedure.hasUnpublishedChanges && (
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'rgba(255, 31, 31, 0.08)',
                            color: '#FF1F1F',
                            fontWeight: 500,
                          }}
                        >
                          Unpublished changes
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mb-4" style={{ backgroundColor: '#E9E9E9' }} />

                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
                  <DetailRow
                    icon={<Box size={14} style={{ color: '#2F80ED' }} />}
                    label="Digital Twin"
                    value="Generator Digital Twin"
                  />
                  <DetailRow
                    icon={<Calendar size={14} style={{ color: '#868D9E' }} />}
                    label="Created"
                    value={procedure.createdDate}
                  />
                  <DetailRow
                    icon={<User size={14} style={{ color: '#868D9E' }} />}
                    label="Created by"
                    value={procedure.createdBy}
                  />
                  <DetailRow
                    icon={<Clock size={14} style={{ color: '#868D9E' }} />}
                    label="Last edited"
                    value={`${procedure.lastEdited} by ${procedure.lastEditedBy}`}
                  />
                </div>

                {/* Divider */}
                <div className="h-px mb-4" style={{ backgroundColor: '#E9E9E9' }} />

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    className="flex items-center gap-2 h-9 px-5 rounded-lg text-sm transition-all"
                    style={{
                      border: '1px solid rgba(47, 128, 237, 0.3)',
                      color: '#2F80ED',
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(47, 128, 237, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(47, 128, 237, 0.5)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(47, 128, 237, 0.3)';
                    }}
                  >
                    Edit in app
                    <ExternalLink size={13} />
                  </button>
                  <button
                    className="flex items-center gap-2 h-9 px-5 rounded-lg text-sm text-white transition-all"
                    style={{
                      backgroundColor: '#2F80ED',
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#82B3F4';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#2F80ED';
                    }}
                  >
                    Edit in canvas
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== PREVIEW TAB ===== */}
          {activeTab === 'preview' && (
            <div className="p-5">
              {/* DT selector */}
              <div className="mb-3 relative">
                <button
                  onClick={() => setShowDTDropdown(!showDTDropdown)}
                  className="flex items-center justify-between w-full max-w-xs h-10 px-4 bg-white rounded-lg text-sm transition-colors"
                  style={{
                    border: '1px solid #C2C9DB',
                    color: '#36415D',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#2F80ED')}
                  onMouseLeave={e => {
                    if (!showDTDropdown) e.currentTarget.style.borderColor = '#C2C9DB';
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Box size={14} style={{ color: '#2F80ED' }} />
                    <span className="truncate">{selectedDT}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    style={{
                      color: '#868D9E',
                      transform: showDTDropdown ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 150ms',
                    }}
                  />
                </button>

                {showDTDropdown && (
                  <div
                    className="absolute top-full left-0 mt-1 w-full max-w-xs bg-white rounded-lg border z-10 py-1"
                    style={{
                      borderColor: '#C2C9DB',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    }}
                  >
                    {['Generator Digital Twin', 'Engine Assembly DT', 'Turbine Module DT'].map(dt => (
                      <button
                        key={dt}
                        onClick={() => {
                          setSelectedDT(dt);
                          setShowDTDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                        style={{
                          color: selectedDT === dt ? '#2F80ED' : '#36415D',
                          fontWeight: selectedDT === dt ? 600 : 400,
                          backgroundColor: selectedDT === dt ? '#D9E0F0' : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (selectedDT !== dt) e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={e => {
                          if (selectedDT !== dt) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Box size={14} style={{ color: selectedDT === dt ? '#2F80ED' : '#868D9E' }} />
                        {dt}
                        {selectedDT === dt && (
                          <Check size={14} className="ml-auto" style={{ color: '#2F80ED' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Preview area */}
              <div
                className="relative w-full rounded-lg overflow-hidden flex items-center justify-center"
                style={{
                  height: 420,
                  background: 'linear-gradient(135deg, #2F80ED 0%, #004FFF 100%)',
                }}
              >
                {/* Play button */}
                <button
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.35)')}
                >
                  <Play size={28} className="text-white ml-1" fill="white" />
                </button>

                {/* DT label */}
                <div
                  className="absolute bottom-4 left-4 text-sm text-white"
                  style={{ fontWeight: 600 }}
                >
                  {selectedDT}
                </div>

                {/* Decorative grid dots */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />
              </div>
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === 'settings' && (
            <div className="p-5 flex flex-col gap-4">
              {/* Text to Speech section */}
              <div
                className="bg-white rounded-lg border p-4"
                style={{ borderColor: '#E9E9E9' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Settings size={15} style={{ color: '#2F80ED' }} />
                  <h3 className="text-sm" style={{ color: '#36415D', fontWeight: 600 }}>
                    Text to Speech
                  </h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  {settingsState.textToSpeech.map(setting => (
                    <label
                      key={setting.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={setting.checked}
                        onChange={() => toggleSetting('textToSpeech', setting.id)}
                        className="w-4 h-4 rounded border-[#C2C9DB] accent-[#2F80ED] cursor-pointer"
                      />
                      <span
                        className="text-sm"
                        style={{ color: '#36415D' }}
                      >
                        {setting.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Logics section */}
              <div
                className="bg-white rounded-lg border p-4"
                style={{ borderColor: '#E9E9E9' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Settings size={15} style={{ color: '#2F80ED' }} />
                  <h3 className="text-sm" style={{ color: '#36415D', fontWeight: 600 }}>
                    Logics
                  </h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  {settingsState.logics.map(setting => (
                    <label
                      key={setting.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={setting.checked}
                        onChange={() => toggleSetting('logics', setting.id)}
                        className="w-4 h-4 rounded border-[#C2C9DB] accent-[#2F80ED] cursor-pointer"
                      />
                      <span
                        className="text-sm"
                        style={{ color: '#36415D' }}
                      >
                        {setting.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== HISTORY TAB ===== */}
          {activeTab === 'history' && (
            <div className="p-5">
              <div
                className="bg-white rounded-lg border"
                style={{ borderColor: '#E9E9E9' }}
              >
                {mockHistory.map((entry, i) => {
                  const isLast = i === mockHistory.length - 1;
                  return (
                    <div
                      key={i}
                      className="flex gap-4 px-5 py-4"
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid #E9E9E9',
                      }}
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center pt-0.5 shrink-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: i === 0 ? '#2F80ED' : '#C2C9DB',
                          }}
                        />
                        {!isLast && (
                          <div
                            className="w-px flex-1 mt-1"
                            style={{ backgroundColor: '#E9E9E9' }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-sm"
                            style={{ color: '#36415D', fontWeight: 600 }}
                          >
                            v{entry.version}
                          </span>
                          {i === 0 && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: '#D9E0F0',
                                color: '#2F80ED',
                                fontWeight: 600,
                              }}
                            >
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-1.5" style={{ color: '#36415D' }}>
                          {entry.note}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] shrink-0"
                              style={{
                                backgroundColor: entry.color,
                                fontWeight: 700,
                              }}
                            >
                              {entry.initials}
                            </div>
                            <span className="text-xs" style={{ color: '#868D9E' }}>
                              {entry.by}
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: '#C2C9DB' }}>
                            |
                          </span>
                          <span className="text-xs" style={{ color: '#868D9E' }}>
                            {entry.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Helper: detail row for overview tab ─── */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs mb-0.5" style={{ color: '#868D9E' }}>
          {label}
        </p>
        <p className="text-sm truncate" style={{ color: '#36415D', fontWeight: 500 }}>
          {value}
        </p>
      </div>
    </div>
  );
}
