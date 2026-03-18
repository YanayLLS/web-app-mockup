import { useState } from 'react';
import { Trash2, ChevronDown, Settings, Save, Lock, Box, ImageIcon } from 'lucide-react';
import svgPaths from '../../../imports/svg-mc05ue2l4h';
import { MemberAvatar } from '../MemberAvatar';

export function SettingsPage() {
  const [projectName, setProjectName] = useState('Elitebook 840 G9');
  const [owner, setOwner] = useState('Owner name');
  const [description, setDescription] = useState(
    `Introducing the Elitebook, a cutting-edge laptop designed for professionals who demand performance and elegance. With its sleek aluminum chassis and ultra-thin profile, the Elitebook combines style with functionality. Equipped with the latest Intel processors, it ensures lightning-fast speed and efficiency for multitasking and demanding applications. The vibrant 15.6-inch display offers stunning visuals, making it perfect for presentations or creative work. Plus, with a long-lasting battery life, you can stay productive all day without worrying about recharging. Experience seamless connectivity with advanced Wi-Fi technology and a range of ports for all your devices. The Elitebook is not just a laptop; it's your ultimate productivity partner.`
  );
  const [privacy, setPrivacy] = useState('Private');
  const [defaultDigitalTwin, setDefaultDigitalTwin] = useState('Elitebook 840 G9');
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [showDigitalTwinMenu, setShowDigitalTwinMenu] = useState(false);

  const sharedUsers = [
    { initials: 'O', color: '#71edaa' },
    { initials: 'O', color: '#b171ed' },
    { initials: 'O', color: '#bfed71' },
    { initials: '+99', color: '#71a2ed' },
  ];

  const privacyOptions = [
    { value: 'Private', desc: 'Only invited members' },
    { value: 'Public', desc: 'Anyone with a link' },
    { value: 'Restricted', desc: 'Workspace members only' },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-auto custom-scrollbar">
      <div className="max-w-[640px] mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
          {/* Title */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
                Edit Project Settings
              </h2>
              <p className="text-xs text-muted mt-0.5">Created Nov 11, 2021</p>
            </div>
          </div>

          {/* Project Name and Owner Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Owner
              </label>
              <div className="relative">
                <button
                  onClick={() => { setShowOwnerMenu(!showOwnerMenu); setShowPrivacyMenu(false); setShowDigitalTwinMenu(false); }}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary/20 hover:bg-secondary/30 transition-all flex items-center justify-between"
                  style={{ fontWeight: 'var(--font-weight-medium)' }}
                >
                  <span>{owner}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${showOwnerMenu ? 'rotate-180' : ''}`} />
                </button>

                {showOwnerMenu && (
                  <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl z-10 overflow-hidden p-1"
                       style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
                    {['Owner name', 'John Doe'].map(name => (
                      <button
                        key={name}
                        onClick={() => { setOwner(name); setShowOwnerMenu(false); }}
                        className={`w-full px-3 py-2.5 text-sm text-left rounded-lg transition-all ${
                          owner === name ? 'bg-primary/[0.06] text-primary' : 'text-foreground hover:bg-secondary'
                        }`}
                        style={{ fontWeight: owner === name ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description and Cover Image Row */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-sm text-foreground mb-2">
                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>Description</span>
                <span className="text-xs text-muted ml-1" style={{ fontWeight: 'var(--font-weight-normal)' }}>(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all resize-none placeholder:text-muted"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Cover Image
              </label>
              <div className="w-32 h-[72px] bg-secondary/30 border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted cursor-pointer hover:bg-secondary/50 hover:border-primary/20 transition-all">
                <ImageIcon size={16} className="mb-1 text-muted/60" />
                <span className="text-[10px]">Upload image</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-card border border-border rounded-xl hover:shadow-sm transition-shadow">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-sm text-foreground mb-1 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                <Lock size={14} className="text-muted" />
                Privacy
              </h3>
              <p className="text-xs text-muted ml-5">Set an access level to this project</p>
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowPrivacyMenu(!showPrivacyMenu); setShowOwnerMenu(false); setShowDigitalTwinMenu(false); }}
                className="w-full sm:w-36 px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary/20 hover:bg-secondary/30 transition-all flex items-center justify-between"
                style={{ fontWeight: 'var(--font-weight-medium)' }}
              >
                <span>{privacy}</span>
                <ChevronDown size={14} className={`text-muted transition-transform ${showPrivacyMenu ? 'rotate-180' : ''}`} />
              </button>

              {showPrivacyMenu && (
                <div className="absolute top-full mt-2 w-64 right-0 bg-card border border-border rounded-xl z-10 overflow-hidden p-1"
                     style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
                  {privacyOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setPrivacy(opt.value); setShowPrivacyMenu(false); }}
                      className={`w-full px-3 py-2.5 text-left rounded-lg transition-all mb-0.5 ${
                        privacy === opt.value
                          ? 'bg-primary/[0.06] border border-primary/15'
                          : 'hover:bg-secondary border border-transparent'
                      }`}
                    >
                      <div className={`text-sm mb-0.5 ${privacy === opt.value ? 'text-primary' : 'text-foreground'}`} style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        {opt.value}
                      </div>
                      <div className="text-xs text-muted">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Share Project With */}
          <div className="px-5 pb-4 flex items-center justify-between border-t border-border/40 pt-4 mx-1 rounded-b-lg bg-secondary/10">
            <p className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Share project with:</p>

            <div className="flex items-center">
              {sharedUsers.map((user, index) => (
                <div
                  key={index}
                  className="-mr-1"
                  style={{ zIndex: sharedUsers.length - index }}
                >
                  <MemberAvatar
                    name={user.initials}
                    initials={user.initials}
                    color={user.color}
                    size="xs"
                    border
                    showTooltip={false}
                    showProfileOnClick={false}
                  />
                </div>
              ))}

              <div className="relative w-6 h-6 bg-primary rounded-full flex items-center justify-center ml-1.5 cursor-pointer hover:brightness-110 hover:shadow-sm hover:shadow-primary/20 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                  <path d={svgPaths.p2f4c2900} fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Default Digital Twin Section */}
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-sm text-foreground mb-1 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                <Box size={14} className="text-muted" />
                Default digital twin
              </h3>
              <p className="text-xs text-muted ml-5">Automatically connects to new procedures</p>
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowDigitalTwinMenu(!showDigitalTwinMenu); setShowOwnerMenu(false); setShowPrivacyMenu(false); }}
                className="w-full sm:w-60 px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary/20 hover:bg-secondary/30 transition-all flex items-center justify-between"
                style={{ fontWeight: 'var(--font-weight-medium)' }}
              >
                <span>{defaultDigitalTwin}</span>
                <ChevronDown size={14} className={`text-muted transition-transform ${showDigitalTwinMenu ? 'rotate-180' : ''}`} />
              </button>

              {showDigitalTwinMenu && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl z-10 overflow-hidden p-1"
                     style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
                  {['Elitebook 840 G9', 'Conveyor System', 'Generator Unit'].map(twin => (
                    <button
                      key={twin}
                      onClick={() => { setDefaultDigitalTwin(twin); setShowDigitalTwinMenu(false); }}
                      className={`w-full px-3 py-2.5 text-sm text-left rounded-lg transition-all ${
                        defaultDigitalTwin === twin ? 'bg-primary/[0.06] text-primary' : 'text-foreground hover:bg-secondary'
                      }`}
                      style={{ fontWeight: defaultDigitalTwin === twin ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                    >
                      {twin}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-destructive text-white rounded-lg text-sm hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <Trash2 size={15} />
            Delete
          </button>

          <div className="flex-1" />

          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
