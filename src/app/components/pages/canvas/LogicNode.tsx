import { useState, useRef, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  Plus,
  X,
  GitBranch,
  ExternalLink,
  Target,
  Monitor,
  Tablet,
  Smartphone,
  Glasses,
  ChevronDown,
  Check
} from 'lucide-react';

interface PlatformOutput {
  id: string;
  platform: 'desktop' | 'mobile' | 'tablet' | 'hololens';
  label: string;
}

export interface LogicNodeData {
  logicType: 'platform-switch' | 'procedure-link' | 'object-target';
  // Platform Switch
  platforms?: PlatformOutput[];
  // Procedure Link
  linkedProcedureId?: string;
  linkedProcedureName?: string;
  // Object Target
  targetObjectName?: string;
  targetObjectDescription?: string;
  editingEnabled?: boolean;
  onChange?: (data: Partial<LogicNodeData>) => void;
  onAction?: (action: 'delete' | 'duplicate') => void;
  onAddConnectedStep?: (sourceHandle?: string) => void;
  connectedHandles?: Set<string>;
  onSelectProcedure?: () => void;
}

type ActiveMenu = 'none' | 'platforms' | 'procedure' | 'target';

export function LogicNode({ data, selected, id }: NodeProps<LogicNodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('none');
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tell ReactFlow to recalculate handle positions when platforms change
  const platformIds = data.platforms?.map(p => p.id).join(',') ?? '';
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, platformIds, updateNodeInternals]);

  // Close menu when clicking outside
  useClickOutside([menuRef, containerRef], () => setActiveMenu('none'));

  const updateData = (updates: Partial<LogicNodeData>) => {
    if (data.onChange) {
      data.onChange(updates);
    }
  };

  const handleToggleMenu = (menu: ActiveMenu) => {
    setActiveMenu(prev => prev === menu ? 'none' : menu);
  };

  const getIcon = () => {
    switch (data.logicType) {
      case 'platform-switch':
        return <GitBranch size={18} />;
      case 'procedure-link':
        return <ExternalLink size={18} />;
      case 'object-target':
        return <Target size={18} />;
    }
  };

  const getTitle = () => {
    switch (data.logicType) {
      case 'platform-switch':
        return 'Platform Switch';
      case 'procedure-link':
        return data.linkedProcedureName || 'Link to Procedure';
      case 'object-target':
        return data.targetObjectName || 'Target Object';
    }
  };

  const getDescription = () => {
    switch (data.logicType) {
      case 'platform-switch':
        return `Route based on platform`;
      case 'procedure-link':
        return data.linkedProcedureName ? 'Execute sub-procedure' : 'Select a procedure';
      case 'object-target':
        return data.targetObjectDescription || 'Select target in AR';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'desktop': return <Monitor size={12} />;
      case 'mobile': return <Smartphone size={12} />;
      case 'tablet': return <Tablet size={12} />;
      case 'hololens': return <Glasses size={12} />;
      default: return null;
    }
  };

  const removePlatform = (id: string) => {
    updateData({ platforms: data.platforms?.filter(p => p.id !== id) });
  };

  const updatePlatform = (id: string, platform: PlatformOutput['platform']) => {
    const platformLabels = {
      desktop: 'Desktop',
      mobile: 'Mobile',
      tablet: 'Tablet',
      hololens: 'HoloLens'
    };
    updateData({ 
      platforms: data.platforms?.map(p => 
        p.id === id ? { ...p, platform, label: platformLabels[platform] } : p
      ) 
    });
  };

  const addPlatform = () => {
    const existingPlatforms = new Set(data.platforms?.map(p => p.platform) || []);
    const availablePlatforms: PlatformOutput['platform'][] = ['desktop', 'mobile', 'tablet', 'hololens'];
    const nextPlatform = availablePlatforms.find(p => !existingPlatforms.has(p));
    
    if (!nextPlatform || (data.platforms?.length || 0) >= 4) return;
    
    const platformLabels = {
      desktop: 'Desktop',
      mobile: 'Mobile',
      tablet: 'Tablet',
      hololens: 'HoloLens'
    };
    
    const newPlatform: PlatformOutput = {
      id: crypto.randomUUID(),
      platform: nextPlatform,
      label: platformLabels[nextPlatform]
    };
    updateData({ platforms: [...(data.platforms || []), newPlatform] });
  };

  // Visual styles based on logic type
  const getColorScheme = () => {
    switch (data.logicType) {
      case 'platform-switch':
        return {
          bg: '#6366f1',
          light: '#818cf8',
          gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
        };
      case 'procedure-link':
        return {
          bg: '#8b5cf6',
          light: '#a78bfa',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
        };
      case 'object-target':
        return {
          bg: '#ec4899',
          light: '#f472b6',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
        };
    }
  };

  const colors = getColorScheme();
  const isPlatformSwitch = data.logicType === 'platform-switch';
  const isProcedureLink = data.logicType === 'procedure-link';

  return (
    <div 
      ref={containerRef}
      className="relative group transition-all duration-200 min-w-[200px] sm:min-w-[240px] w-max max-w-[90vw] sm:max-w-[320px]"
    >
      <div
        className="relative border-2 rounded-lg transition-all"
        style={{
          borderColor: selected ? 'var(--primary)' : colors.bg,
          backgroundColor: 'var(--card)',
          boxShadow: selected ? 'var(--elevation-lg)' : 'var(--elevation-sm)',
                    overflow: 'visible'
        }}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Top}
          className=""
          style={{
            width: 16, height: 16,
            left: '50%',
            top: -8,
            transform: 'translateX(-50%)',
            background: colors.bg,
            border: '2px solid var(--card)',
            cursor: 'crosshair',
            zIndex: 10,
          }}
        />

        {/* Header with gradient */}
        <div 
          className="p-3 flex items-center gap-2.5 rounded-t-[4px] overflow-hidden"
          style={{ 
            background: colors.gradient
          }}
        >
          <div className="w-8 h-8 rounded-md flex items-center justify-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div style={{ color: 'white' }}>
              {getIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white truncate">
              {getTitle()}
            </div>
            <div className="text-xs opacity-90 text-white truncate">
              {getDescription()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 flex flex-col gap-2">
          {/* Configuration Button */}
          {isPlatformSwitch && (
            <button
              onClick={() => data.editingEnabled !== false && handleToggleMenu('platforms')}
              className="canvas-config-btn w-full flex items-center justify-between px-3 py-2 rounded border text-xs transition-colors"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: (data.platforms?.length || 0) > 0 ? 'var(--secondary)' : 'transparent',
                color: 'var(--foreground)'
              }}
            >
              <span className="font-medium">
                {(data.platforms?.length || 0) > 0
                  ? `${data.platforms?.length} Platform${data.platforms?.length !== 1 ? 's' : ''}`
                  : 'Configure Platforms'}
              </span>
              <ChevronDown size={14} />
            </button>
          )}

          {isProcedureLink && (
            <>
              <button
                onClick={() => data.editingEnabled !== false && data.onSelectProcedure?.()}
                className="canvas-config-btn w-full flex items-center justify-between px-3 py-2 rounded border text-xs transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: data.linkedProcedureId ? 'var(--secondary)' : 'transparent',
                  color: 'var(--foreground)'
                }}
              >
                <span className="font-medium truncate">
                  {data.linkedProcedureName || 'Select Procedure'}
                </span>
                <ExternalLink size={14} />
              </button>
            </>
          )}

          {data.logicType === 'object-target' && (
            <>
              <button
                onClick={() => data.editingEnabled !== false && handleToggleMenu('target')}
                className="canvas-config-btn w-full flex items-center justify-between px-3 py-2 rounded border text-xs transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: data.targetObjectName ? 'var(--secondary)' : 'transparent',
                  color: 'var(--foreground)'
                }}
              >
                <span className="font-medium truncate">
                  {data.targetObjectName || 'Configure Target'}
                </span>
                <Target size={14} />
              </button>
            </>
          )}
        </div>

        {/* Floating Configuration Menus */}
        {activeMenu !== 'none' && (
          <div 
            ref={menuRef}
            className="absolute top-full mt-2 left-0 sm:top-0 sm:left-full sm:ml-3 rounded-lg border p-4 z-50 min-w-[220px] sm:min-w-[260px] max-w-[calc(100vw-2rem)] sm:max-w-[300px] animate-in slide-in-from-left-2 duration-200"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--elevation-lg)',
            }}
          >
            {/* Platform Configuration */}
            {activeMenu === 'platforms' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Platform Routes</span>
                  <div className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: 'var(--muted)', backgroundColor: 'var(--secondary)' }}>
                    {data.platforms?.length || 0} / 4
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {data.platforms?.map((platform) => (
                    <div key={platform.id} className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: colors.bg, color: 'white' }}>
                          {getPlatformIcon(platform.platform)}
                        </div>
                        <select
                          value={platform.platform}
                          onChange={(e) => updatePlatform(platform.id, e.target.value as PlatformOutput['platform'])}
                          className="canvas-input flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <option value="desktop">Desktop</option>
                          <option value="mobile">Mobile</option>
                          <option value="tablet">Tablet</option>
                          <option value="hololens">HoloLens</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removePlatform(platform.id)}
                        className="canvas-remove-btn p-2 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(data.platforms?.length || 0) < 4 && (
                    <button
                      onClick={addPlatform}
                      className="canvas-config-btn flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded transition-colors border border-dashed mt-1"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--muted)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <Plus size={14} /> Add Platform
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Object Target Configuration */}
            {activeMenu === 'target' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Target Object</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide mb-1 block" style={{ color: 'var(--muted)' }}>
                      Object Name
                    </label>
                    <input
                      type="text"
                      value={data.targetObjectName || ''}
                      onChange={(e) => updateData({ targetObjectName: e.target.value })}
                      placeholder="e.g., Machine Panel"
                      className="canvas-input w-full text-xs border rounded px-2.5 py-1.5 focus:outline-none"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide mb-1 block" style={{ color: 'var(--muted)' }}>
                      Description
                    </label>
                    <textarea
                      value={data.targetObjectDescription || ''}
                      onChange={(e) => updateData({ targetObjectDescription: e.target.value })}
                      placeholder="Describe what to target..."
                      rows={3}
                      className="canvas-input w-full text-xs border rounded px-2.5 py-1.5 focus:outline-none resize-none"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Handles */}
        {isPlatformSwitch && data.platforms && data.platforms.length > 0 ? (
          <>
            {data.platforms.map((platform, index) => {
              const totalPlatforms = data.platforms.length;
              const leftPercent = totalPlatforms === 1 ? 50 : 8 + (index / (totalPlatforms - 1)) * 84;
              return (
                <Handle
                  key={platform.id}
                  type="source"
                  position={Position.Bottom}
                  id={platform.id}
                  className=""
                  style={{
                    width: 16, height: 16,
                    left: `${leftPercent}%`,
                    bottom: -8,
                    transform: 'translateX(-50%)',
                    background: colors.bg,
                    border: '2px solid var(--card)',
                    cursor: 'crosshair',
                    zIndex: 10,
                  }}
                />
              );
            })}
            {/* Labels and add-buttons */}
            <div className="absolute -bottom-2 left-2 right-2 z-10 pointer-events-none" style={{ height: '20px', overflow: 'visible' }}>
              {data.platforms.map((platform, index) => {
                const isConnected = data.connectedHandles?.has(platform.id);
                const totalPlatforms = data.platforms.length;
                const leftPercent = totalPlatforms === 1 ? 50 : 8 + (index / (totalPlatforms - 1)) * 84;
                return (
                  <div key={platform.id} className="absolute pointer-events-auto" style={{ left: `${leftPercent}%`, top: 0, transform: 'translateX(-50%)' }}>
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 border text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm opacity-100 transition-opacity text-center whitespace-nowrap z-20 flex items-center gap-1"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: colors.bg + '40',
                        color: colors.bg
                      }}
                    >
                      {getPlatformIcon(platform.platform)}
                      {platform.label}
                    </div>
                    {!isConnected && data.editingEnabled !== false && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          data.onAddConnectedStep?.(platform.id);
                        }}
                        className="canvas-add-btn absolute top-12 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 nodrag opacity-40 hover:opacity-100 shadow-md hover:shadow-lg"
                        title="Add connected step"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Single output for procedure-link and object-target
          <>
            <Handle
              type="source"
              position={Position.Bottom}
              id="default"
              className=""
              style={{
                width: 16, height: 16,
                left: '50%',
                bottom: -8,
                transform: 'translateX(-50%)',
                background: colors.bg,
                border: '2px solid var(--card)',
                cursor: 'crosshair',
                zIndex: 10,
              }}
            />
            {!data.connectedHandles?.has('default') && data.editingEnabled !== false && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onAddConnectedStep?.();
                }}
                className="canvas-add-btn absolute -bottom-2 left-1/2 -translate-x-1/2 mt-6 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 nodrag opacity-40 hover:opacity-100 shadow-md hover:shadow-lg z-10"
                style={{ top: 'calc(100% + 8px)' }}
                title="Add connected step"
              >
                <Plus size={18} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
