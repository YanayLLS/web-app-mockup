import { useState } from 'react';
import { Palette, Upload } from 'lucide-react';
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
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [accentColor, setAccentColor] = useState('#2F80ED');

  const presetColors = [
    '#2F80ED', '#11E874', '#FF1F1F', '#2F80ED', '#FF9500',
    '#00D9FF', '#FF3B82', '#10B981', '#F59E0B', '#8B5CF6'
  ];

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Workspace Design
        </h1>
        <p className="text-muted" style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)'
        }}>
          Customize your workspace appearance and branding
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl space-y-6">
          {/* Workspace Logo */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Workspace Logo
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center p-4 flex-shrink-0">
                <div className="w-full h-full text-primary">
                  <IconLogo />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-muted mb-3" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Frontline logo is used for your workspace. Recommended size: 256x256px
                </p>
                <button className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-secondary text-foreground rounded-[var(--radius)] hover:bg-secondary/80 transition-colors" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  <Upload size={16} />
                  <span>Upload Logo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Name */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Workspace Name
            </h2>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground"
              style={{
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family)'
              }}
            />
          </div>

          {/* Accent Color */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Accent Color
            </h2>
            <p className="text-muted mb-4" style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)'
            }}>
              Choose a color to personalize your workspace interface
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mb-4">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-10 h-10 min-h-[44px] rounded-[var(--radius)] transition-all hover:scale-110 ${
                    accentColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-foreground" style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                Custom:
              </label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-20 h-10 rounded-[var(--radius)] border border-border cursor-pointer"
              />
              <span className="text-muted" style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)'
              }}>
                {accentColor}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 min-h-[44px] bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
