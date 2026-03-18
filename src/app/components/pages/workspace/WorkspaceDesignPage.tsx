import { useState, useRef } from 'react';
import { Upload, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import svgPaths from "../../../../imports/svg-albmkprcym";

function IconLogo() {
  return (
    <svg className="block w-full h-full" fill="none" viewBox="0 0 24 24">
      <g>
        <path d={svgPaths.p2e071580} fill="currentColor" />
        <path d={svgPaths.p159c9f80} fill="currentColor" />
        <path d={svgPaths.p50fb500} fill="currentColor" />
        <path d={svgPaths.p1f65b900} fill="currentColor" />
      </g>
    </svg>
  );
}

export function WorkspaceDesignPage() {
  const { workspace, updateWorkspace } = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [accentColor, setAccentColor] = useState(workspace.accentColor);
  const [logoUrl, setLogoUrl] = useState<string | null>(workspace.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetColors = [
    { color: '#2F80ED', name: 'Blue' },
    { color: '#11E874', name: 'Green' },
    { color: '#FF1F1F', name: 'Red' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#FF9500', name: 'Orange' },
    { color: '#00D9FF', name: 'Cyan' },
    { color: '#FF3B82', name: 'Pink' },
    { color: '#10B981', name: 'Emerald' },
    { color: '#F59E0B', name: 'Amber' },
    { color: '#6366F1', name: 'Indigo' },
  ];

  const handleSave = () => {
    updateWorkspace({
      name: workspaceName.trim() || workspace.name,
      accentColor,
      logoUrl,
    });
    toast.success('Workspace design saved');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          Workspace Design
        </h1>
        <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
          Customize your workspace appearance and branding
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl space-y-5">

          {/* Workspace Logo */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-4 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Workspace Logo
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/12 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0 overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(47,128,237,0.08)' }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Workspace logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full text-primary p-4">
                    <IconLogo />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-muted mb-3" style={{ fontSize: 'var(--text-sm)' }}>
                  {logoUrl ? 'Custom logo uploaded' : 'Frontline logo is used for your workspace'}. Recommended size: 256x256px
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 hover:shadow-sm transition-all" style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}>
                    <Upload size={15} className="text-muted" />
                    <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  </button>
                  {logoUrl && (
                    <button
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-2 px-4 py-2.5 bg-card text-muted border border-border rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all" style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}>
                      <RotateCcw size={15} />
                      <span>Reset to Default</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Name */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-4 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Workspace Name
            </h2>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            />
            <p className="text-muted mt-2" style={{ fontSize: 'var(--text-sm)' }}>
              This only changes the display name. It does not affect your workspace address or domain.
            </p>
          </div>

          {/* Accent Color */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-1 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Accent Color
            </h2>
            <p className="text-muted mb-5 ml-3" style={{ fontSize: 'var(--text-sm)' }}>
              Choose a color to personalize your workspace interface
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mb-5">
              {presetColors.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setAccentColor(preset.color)}
                  className="relative w-10 h-10 rounded-xl transition-all hover:scale-110 group"
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: accentColor === preset.color ? `0 0 0 2px var(--card), 0 0 0 4px ${preset.color}` : `0 2px 8px ${preset.color}30`,
                  }}
                  title={preset.name}
                >
                  {accentColor === preset.color && (
                    <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow-sm" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
            {/* Custom color + preview */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <label className="text-foreground text-xs shrink-0" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Custom
              </label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-none cursor-pointer"
                style={{ padding: 0 }}
              />
              <input
                type="text"
                value={accentColor.toUpperCase()}
                onChange={(e) => {
                  let v = e.target.value;
                  if (!v.startsWith('#')) v = '#' + v;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setAccentColor(v);
                }}
                onBlur={() => {
                  if (!/^#[0-9A-Fa-f]{6}$/.test(accentColor)) setAccentColor('#2F80ED');
                }}
                maxLength={7}
                className="text-xs text-foreground bg-card px-2 py-1 rounded border border-border/50 font-mono w-[72px] outline-none focus:border-primary transition-colors"
              />
              <span className="flex-1" />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-white rounded-lg hover:brightness-110 hover:shadow-md transition-all flex items-center gap-2"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-bold)',
                backgroundColor: accentColor,
                boxShadow: `0 4px 12px ${accentColor}40`,
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
