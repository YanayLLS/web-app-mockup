import { useState, useEffect } from 'react';
import { X, Settings, Box, Palette, Volume2, Captions, Users, Globe, ChevronDown, MessageSquare, Plus, Minus, Check, Shield } from 'lucide-react';
import { useRole, ROLES, type UserRole } from '../../../contexts/RoleContext';

type SettingsTab = 'general' | '3d-environment' | 'appearance' | 'audio-video' | 'captions' | 'account' | 'debug';

const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: '3d-environment', label: '3D Environment', icon: Box },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'audio-video', label: 'Audio & Video', icon: Volume2 },
  { id: 'captions', label: 'Captions and transcripts', icon: Captions },
  { id: 'account', label: 'Account', icon: Users },
  { id: 'debug', label: 'Debug', icon: Shield },
];

const appRoleGroups: { label: string; roles: UserRole[] }[] = [
  { label: 'External', roles: ['guest'] },
  { label: 'Operators', roles: ['operator', 'operator-mr'] },
  { label: 'Support & Field', roles: ['field-service-engineer', 'service-support-expert', 'service-support-manager'] },
  { label: 'Content & Admin', roles: ['instructor', 'content-creator', 'admin'] },
];

const workspaces = [
  'SHOWROOM', 'SUBYANAY', 'HP-INDIGO-CLONE', 'LLS', 'ANDREYFRONTLINE-0', 'YONI', 'HPINDIGO',
];

const bgImages = [
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=80&fit=crop',
];

interface AppSettingsModalProps {
  onClose: () => void;
}

export function AppSettingsModal({ onClose }: AppSettingsModalProps) {
  const { currentRole, setRole } = useRole();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [language, setLanguage] = useState('English');
  const [runAtStartup, setRunAtStartup] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [powerMode, setPowerMode] = useState<'efficiency' | 'auto' | 'performance'>('performance');
  const [showTooltips, setShowTooltips] = useState(false);
  const [zoomSensitivity, setZoomSensitivity] = useState(50);
  const [rotationSensitivity, setRotationSensitivity] = useState(70);
  const [panSensitivity, setPanSensitivity] = useState(60);
  const [uiScale, setUiScale] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [microphone, setMicrophone] = useState('Default');
  const [camera, setCamera] = useState('Default');
  const [realMics, setRealMics] = useState<string[]>(['Default']);
  const [realCameras, setRealCameras] = useState<string[]>(['Default']);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const mics = devices.filter(d => d.kind === 'audioinput').map(d => d.label || `Microphone ${d.deviceId.slice(0, 4)}`);
      const cams = devices.filter(d => d.kind === 'videoinput').map(d => d.label || `Camera ${d.deviceId.slice(0, 4)}`);
      if (mics.length) { setRealMics(mics); setMicrophone(mics[0]); }
      if (cams.length) { setRealCameras(cams); setCamera(cams[0]); }
    }).catch(() => {});
  }, []);
  const [videoBg, setVideoBg] = useState<'none' | 'ambient' | string>('none');
  const [captionLang, setCaptionLang] = useState('English Us');
  const [wsSearch, setWsSearch] = useState('');

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.toLowerCase().includes(wsSearch.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto flex flex-col overflow-hidden w-full sm:w-[720px]"
          style={{
            maxWidth: '100%',
            height: '520px',
            maxHeight: '85vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 20px', borderBottom: '1px solid #E9E9E9' }}>
            <span style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Settings</span>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ fontSize: '12px', color: '#7F7F7F' }}>
                <MessageSquare style={{ width: '14px', height: '14px' }} />
                Send feedback
              </button>
              <button onClick={onClose} className="hover:bg-secondary rounded-lg p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close settings">
                <X style={{ width: '16px', height: '16px', color: '#36415D' }} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col sm:flex-row flex-1 min-h-0">
            {/* Tabs - horizontal scroll on mobile, vertical sidebar on sm+ */}
            <div className="shrink-0 flex sm:flex-col overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-[#E9E9E9] p-1 sm:p-2 sm:w-[170px]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 text-left rounded-lg transition-colors whitespace-nowrap sm:whitespace-normal sm:w-full shrink-0"
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                      color: isActive ? '#36415D' : '#7F7F7F',
                      backgroundColor: isActive ? '#D9E0F0' : 'transparent',
                      minHeight: '40px',
                    }}
                  >
                    <Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
              {/* ========== GENERAL ========== */}
              {activeTab === 'general' && (
                <div>
                  <SectionTitle>App language</SectionTitle>
                  <SelectField value={language} onChange={setLanguage} options={['English', 'Spanish', 'French', 'German', 'Hebrew']} icon={<Globe style={{ width: '14px', height: '14px' }} />} />

                  <div style={{ marginTop: '16px' }}>
                    <Checkbox checked={runAtStartup} onChange={setRunAtStartup} label="Run at startup" />
                    <Checkbox checked={minimizeToTray} onChange={setMinimizeToTray} label="Minimize to tray" />
                  </div>

                  <SectionTitle style={{ marginTop: '20px' }}>Power & Quality</SectionTitle>
                  <p style={{ fontSize: '12px', color: '#7F7F7F', marginBottom: '10px' }}>Choose whether to save battery or enjoy a smoother experience.</p>
                  <div className="flex" style={{ borderRadius: '25px', overflow: 'hidden', border: '1px solid #C2C9DB' }}>
                    {(['efficiency', 'auto', 'performance'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPowerMode(mode)}
                        className="flex-1 text-center transition-colors"
                        style={{
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 'var(--font-weight-medium)',
                          backgroundColor: powerMode === mode ? '#2F80ED' : 'transparent',
                          color: powerMode === mode ? 'white' : '#36415D',
                        }}
                      >
                        {mode === 'efficiency' ? 'Power Efficiency' : mode === 'auto' ? 'Auto' : 'Performance'}
                      </button>
                    ))}
                  </div>

                  <SectionTitle style={{ marginTop: '20px' }}>Application Information</SectionTitle>
                  <InfoRow>Version 25.4.1 (build number 25.4.21)</InfoRow>
                  <InfoRow>Frame Rate: 59 FPS</InfoRow>
                  <InfoRow>SDK version d07db3a9 from Tue Nov 9 20:15:00 2021 +0200</InfoRow>

                  <button
                    className="w-full flex items-center justify-center text-white hover:brightness-110 transition-opacity"
                    style={{ marginTop: '16px', padding: '10px', backgroundColor: '#2F80ED', borderRadius: '25px', fontSize: '12px' }}
                  >
                    Clear cache
                  </button>
                </div>
              )}

              {/* ========== 3D ENVIRONMENT ========== */}
              {activeTab === '3d-environment' && (
                <div>
                  <Checkbox checked={showTooltips} onChange={setShowTooltips} label="Show tooltips when hovering on parts" />

                  <div className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                    <SectionTitle style={{ marginBottom: 0 }}>Navigation</SectionTitle>
                    <button style={{ fontSize: '12px', color: '#2F80ED' }}>Reset</button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#7F7F7F', marginBottom: '14px', marginTop: '4px' }}>Adjusts navigation sensitivity within the digital twin environment.</p>

                  <SliderField label="Zoom Sensitivity" value={zoomSensitivity} onChange={setZoomSensitivity} />
                  <SliderField label="Rotation Sensitivity" value={rotationSensitivity} onChange={setRotationSensitivity} />
                  <SliderField label="Pan Sensitivity" value={panSensitivity} onChange={setPanSensitivity} />

                  <div className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                    <SectionTitle style={{ marginBottom: 0 }}>Selection</SectionTitle>
                    <button style={{ fontSize: '12px', color: '#2F80ED' }}>Reset</button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#7F7F7F', marginBottom: '10px', marginTop: '4px' }}>Set your preferred selection color for digital twin components.</p>

                  <div className="flex items-center gap-2">
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#4A6A8A', position: 'relative' }}>
                      <div
                        className="absolute flex items-center justify-center"
                        style={{ top: '4px', right: '4px', width: '16px', height: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '3px' }}
                      >
                        <X style={{ width: '10px', height: '10px', color: 'white' }} />
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#7F7F7F', marginTop: '4px', display: 'block' }}>Parts selection color</span>

                  <SectionTitle style={{ marginTop: '20px' }}>Graphics</SectionTitle>
                </div>
              )}

              {/* ========== APPEARANCE ========== */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: '#36415D' }}>User interface scale</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>{uiScale}%</span>
                      <button
                        onClick={() => setUiScale(Math.max(50, uiScale - 10))}
                        className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                        style={{ width: '24px', height: '24px', backgroundColor: '#2F80ED', color: 'white' }}
                      >
                        <Minus style={{ width: '12px', height: '12px' }} />
                      </button>
                      <button
                        onClick={() => setUiScale(Math.min(200, uiScale + 10))}
                        className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                        style={{ width: '24px', height: '24px', backgroundColor: '#11E874', color: 'white' }}
                      >
                        <Plus style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  </div>

                  <Checkbox checked={darkMode} onChange={setDarkMode} label="Enable dark mode (beta)" />
                </div>
              )}

              {/* ========== AUDIO & VIDEO ========== */}
              {activeTab === 'audio-video' && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span style={{ fontSize: '13px', color: '#36415D', width: '90px', flexShrink: 0 }}>Microphone</span>
                    <SelectField value={microphone} onChange={setMicrophone} options={realMics} />
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <span style={{ fontSize: '13px', color: '#36415D', width: '90px', flexShrink: 0 }}>Camera</span>
                    <SelectField value={camera} onChange={setCamera} options={realCameras} />
                  </div>

                  <SectionTitle>Video background</SectionTitle>
                  <div className="flex flex-wrap" style={{ gap: '10px' }}>
                    {/* None */}
                    <button
                      onClick={() => setVideoBg('none')}
                      className="flex flex-col items-center justify-center"
                      style={{
                        width: '100px',
                        height: '70px',
                        borderRadius: '8px',
                        backgroundColor: videoBg === 'none' ? '#2F80ED' : '#D9E0F0',
                        color: videoBg === 'none' ? 'white' : '#36415D',
                        fontSize: '12px',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      <X style={{ width: '16px', height: '16px', marginBottom: '4px' }} />
                      None
                    </button>
                    {/* Ambient */}
                    <button
                      onClick={() => setVideoBg('ambient')}
                      className="flex flex-col items-center justify-center"
                      style={{
                        width: '100px',
                        height: '70px',
                        borderRadius: '8px',
                        backgroundColor: videoBg === 'ambient' ? '#2F80ED' : '#D9E0F0',
                        color: videoBg === 'ambient' ? 'white' : '#36415D',
                        fontSize: '12px',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      <Settings style={{ width: '16px', height: '16px', marginBottom: '4px' }} />
                      Ambient
                    </button>
                    {/* Custom placeholder */}
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: '100px',
                        height: '70px',
                        borderRadius: '8px',
                        backgroundColor: '#E9E9E9',
                        overflow: 'hidden',
                      }}
                    >
                      <img src={bgImages[2]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </div>

                  {/* Background image thumbnails */}
                  <div className="flex flex-wrap" style={{ gap: '10px', marginTop: '12px' }}>
                    {bgImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setVideoBg(img)}
                        className="overflow-hidden hover:opacity-80 transition-opacity"
                        style={{
                          width: '100px',
                          height: '70px',
                          borderRadius: '8px',
                          border: videoBg === img ? '2px solid #2F80ED' : '2px solid transparent',
                        }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ========== CAPTIONS & TRANSCRIPTS ========== */}
              {activeTab === 'captions' && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span style={{ fontSize: '13px', color: '#36415D' }}>Language</span>
                    <Globe style={{ width: '14px', height: '14px', color: '#7F7F7F' }} />
                  </div>
                  <SelectField
                    value={captionLang}
                    onChange={setCaptionLang}
                    options={['English Us', 'English UK', 'Spanish', 'French', 'German', 'Hebrew']}
                    icon={
                      <span style={{ fontSize: '16px' }}>🇺🇸</span>
                    }
                  />
                </div>
              )}

              {/* ========== ACCOUNT ========== */}
              {activeTab === 'account' && (
                <div>
                  {/* User info */}
                  <div className="flex items-center gap-4" style={{ marginBottom: '20px' }}>
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: '48px', height: '48px', backgroundColor: '#C2C9DB' }}
                    >
                      <Users style={{ width: '24px', height: '24px', color: '#7F7F7F' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Yanay</div>
                      <div style={{ fontSize: '12px', color: '#7F7F7F' }}>yanay@fls-ltd.com</div>
                    </div>
                    <button
                      className="hover:brightness-110 transition-opacity"
                      style={{ padding: '6px 16px', backgroundColor: '#2F80ED', color: 'white', borderRadius: '25px', fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      Manage
                    </button>
                    <button
                      className="hover:brightness-110 transition-opacity"
                      style={{ padding: '6px 16px', backgroundColor: '#FF1F1F', color: 'white', borderRadius: '25px', fontSize: '12px', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      Logout
                    </button>
                  </div>

                  {/* Workspaces */}
                  <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Available workspaces</span>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={wsSearch}
                      onChange={(e) => setWsSearch(e.target.value)}
                      className="outline-none"
                      style={{
                        width: '140px',
                        height: '30px',
                        padding: '0 10px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #C2C9DB',
                        color: '#36415D',
                      }}
                    />
                  </div>

                  <div className="flex flex-col" style={{ gap: '6px' }}>
                    {filteredWorkspaces.map((ws) => (
                      <div key={ws} className="flex items-center justify-between" style={{ padding: '8px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>{ws}</span>
                        <button
                          className="hover:brightness-110 transition-opacity"
                          style={{
                            padding: '6px 20px',
                            backgroundColor: '#2F80ED',
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '12px',
                            fontWeight: 'var(--font-weight-medium)',
                          }}
                        >
                          Launch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========== DEBUG ========== */}
              {activeTab === 'debug' && (
                <div>
                  {/* Current role badge */}
                  <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#7F7F7F' }}>Active role:</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        backgroundColor: '#11E874',
                        color: '#1a3a2a',
                        borderRadius: '25px',
                        fontSize: '12px',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      <Shield style={{ width: '12px', height: '12px' }} />
                      {ROLES[currentRole].label}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#7F7F7F', marginBottom: '16px' }}>
                    {ROLES[currentRole].description}
                  </p>

                  {/* Role groups */}
                  {appRoleGroups.map((group) => (
                    <div key={group.label} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'var(--font-weight-bold)', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        {group.label}
                      </div>
                      <div className="flex flex-col" style={{ gap: '4px' }}>
                        {group.roles.map((roleId) => {
                          const role = ROLES[roleId];
                          const isActive = currentRole === roleId;
                          return (
                            <button
                              key={roleId}
                              onClick={() => setRole(roleId)}
                              className="flex items-center gap-3 w-full text-left transition-all"
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                                border: isActive ? '1.5px solid #11E874' : '1.5px solid transparent',
                              }}
                            >
                              <div
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  borderRadius: '50%',
                                  border: isActive ? 'none' : '2px solid #C2C9DB',
                                  backgroundColor: isActive ? '#11E874' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {isActive && (
                                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div style={{ fontSize: '12px', fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)', color: '#36415D' }}>
                                  {role.label}
                                </div>
                                <div style={{ fontSize: '10px', color: '#7F7F7F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {role.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== Helper components ===== */

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', marginBottom: '8px', ...style }}>
      {children}
    </div>
  );
}

function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-center"
      style={{
        padding: '8px 12px',
        backgroundColor: '#E9E9E9',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#36415D',
        marginBottom: '6px',
      }}
    >
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: '8px' }}>
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '3px',
          border: checked ? 'none' : '1.5px solid #C2C9DB',
          backgroundColor: checked ? '#2F80ED' : 'white',
        }}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check style={{ width: '10px', height: '10px', color: 'white' }} />}
      </div>
      <span style={{ fontSize: '13px', color: '#36415D' }} onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

function SelectField({ value, onChange, options, icon }: { value: string; onChange: (v: string) => void; options: string[]; icon?: React.ReactNode }) {
  return (
    <div className="relative flex-1">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none cursor-pointer outline-none"
        style={{
          height: '36px',
          padding: icon ? '0 32px 0 32px' : '0 32px 0 12px',
          fontSize: '13px',
          color: '#36415D',
          border: '1px solid #C2C9DB',
          borderRadius: '8px',
          backgroundColor: 'white',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '14px', height: '14px', color: '#7F7F7F' }} />
    </div>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <span style={{ fontSize: '12px', color: '#36415D', display: 'block', marginBottom: '6px' }}>{label}</span>
      <div className="flex items-center gap-3">
        <span style={{ fontSize: '10px', color: '#7F7F7F', width: '28px' }}>Slow</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: '#2F80ED', height: '4px' }}
        />
        <span style={{ fontSize: '10px', color: '#7F7F7F', width: '28px', textAlign: 'right' }}>Fast</span>
      </div>
    </div>
  );
}
