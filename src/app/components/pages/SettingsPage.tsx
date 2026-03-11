import { useState } from 'react';
import { Trash2, X, ChevronDown, UserPlus } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <div className="max-w-[600px] mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-[var(--radius)] p-4">
          <div className="mb-4">
            <h2 
              className="text-base text-foreground uppercase mb-1.5" 
              style={{ fontWeight: 'var(--font-weight-bold)' }}
            >
              Edit Project Settings
            </h2>
            <p className="text-xs text-foreground mb-1">Created at 11/11/2021</p>
            <p className="text-xs text-foreground">
              A Project has its own digital twins, procedures and media.
            </p>
          </div>

          {/* Project Name and Owner Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label 
                className="block text-sm text-foreground mb-1.5" 
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full h-9 px-3 py-2 bg-secondary border border-border rounded-[var(--radius)] text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label 
                className="block text-sm text-foreground mb-1.5" 
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Owner
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                  className="w-full h-9 px-3 py-2 bg-card border border-border rounded-[var(--radius)] text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
                >
                  <span>{owner}</span>
                  <ChevronDown size={14} />
                </button>
                
                {showOwnerMenu && (
                  <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-[var(--radius)] shadow-lg z-10"
                       style={{ boxShadow: 'var(--elevation-sm)' }}>
                    <button
                      onClick={() => { setOwner('Owner name'); setShowOwnerMenu(false); }}
                      className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                    >
                      Owner name
                    </button>
                    <button
                      onClick={() => { setOwner('John Doe'); setShowOwnerMenu(false); }}
                      className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                    >
                      John Doe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description and Cover Image Row */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">
                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>Description</span>
                <span className="text-xs text-muted ml-1">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-[var(--radius)] text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label 
                className="block text-sm text-foreground mb-1.5" 
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Cover Image
              </label>
              <div className="w-32 h-[72px] bg-secondary border border-border rounded-[var(--radius)] flex items-center justify-center text-xs text-muted">
                No image
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-card border border-border rounded-[var(--radius)]">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h3
                className="text-sm text-foreground mb-1"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Privacy
              </h3>
              <p className="text-xs text-foreground">Set an access level to this project</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="w-full sm:w-32 h-9 px-3 py-2 bg-card border border-border rounded-[var(--radius)] text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
              >
                <span>{privacy}</span>
                <ChevronDown size={14} />
              </button>
              
              {showPrivacyMenu && (
                <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-[var(--radius)] shadow-lg z-10"
                     style={{ boxShadow: 'var(--elevation-sm)' }}>
                  <button
                    onClick={() => { setPrivacy('Private'); setShowPrivacyMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    Private
                  </button>
                  <button
                    onClick={() => { setPrivacy('Public'); setShowPrivacyMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    Public
                  </button>
                  <button
                    onClick={() => { setPrivacy('Restricted'); setShowPrivacyMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    Restricted
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Share Project With */}
          <div className="px-4 pb-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-foreground">Share project with:</p>
            
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
              
              <div className="relative w-5 h-5 bg-accent rounded-full flex items-center justify-center ml-1 cursor-pointer hover:bg-accent/90 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                    <path d={svgPaths.p2f4c2900} fill="white" />
                  </svg>
                </div>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full flex items-center justify-center text-[8px] text-white"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  +
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Default Digital Twin Section */}
        <div className="bg-card border border-border rounded-[var(--radius)] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h3
                className="text-sm text-foreground mb-1"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Default digital twin
              </h3>
              <p className="text-xs text-foreground">Automatically connects to new procedures</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDigitalTwinMenu(!showDigitalTwinMenu)}
                className="w-full sm:w-60 h-9 px-3 py-2 bg-card border border-border rounded-[var(--radius)] text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
              >
                <span>{defaultDigitalTwin}</span>
                <ChevronDown size={14} />
              </button>
              
              {showDigitalTwinMenu && (
                <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-[var(--radius)] shadow-lg z-10"
                     style={{ boxShadow: 'var(--elevation-sm)' }}>
                  <button
                    onClick={() => { setDefaultDigitalTwin('Elitebook 840 G9'); setShowDigitalTwinMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    Elitebook 840 G9
                  </button>
                  <button
                    onClick={() => { setDefaultDigitalTwin('Conveyor System'); setShowDigitalTwinMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    Conveyor System
                  </button>
                  <button
                    onClick={() => { setDefaultDigitalTwin('Generator Unit'); setShowDigitalTwinMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    Generator Unit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
          <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-[var(--radius)] text-xs hover:bg-destructive/90 transition-colors">
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
          
          <div className="flex-1" />
          
          <button className="px-4 py-2 bg-primary text-white rounded-[var(--radius)] text-xs hover:bg-primary/90 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
