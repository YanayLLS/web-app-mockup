import { useState, useEffect, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  ListChecks,
  Plus, 
  X,
  Trash2,
  Copy,
  MessageSquare,
  Palette,
  GitFork,
  TextCursorInput,
  Camera,
  ScanBarcode,
  Type,
  Check,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface Option {
  id: string;
  text: string;
}

interface PopupNotice {
  id: string;
  title: string;
  description: string;
  media: string[]; // Array of media IDs
  color: string;
}

export interface DynamicNodeData {
  title: string;
  description: string;
  isColorized: boolean;
  color?: string;
  isInput: boolean;
  inputType: 'text' | 'picture' | 'barcode';
  isBranching: boolean;
  options: Option[];
  popups: PopupNotice[];
  checklist: ChecklistItem[];
  media: string[]; // Array of media IDs attached to this step
  editingEnabled?: boolean;
  onChange?: (data: Partial<DynamicNodeData>) => void;
  onAction?: (action: 'delete' | 'duplicate') => void;
  onAddOption?: () => void;
  onAddConnectedStep?: (sourceHandle?: string) => void;
  connectedHandles?: Set<string>;
  onOpenMediaLibrary?: (callback: (selectedMedia: string[]) => void) => void;
}

type ActiveMenu = 'none' | 'colorize' | 'input' | 'branching' | 'popup' | 'checklist' | 'media';

export function DynamicNode({ data, selected, id }: NodeProps<DynamicNodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('none');
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Migrate old popup data format to new format
  useEffect(() => {
    if (!data.popups && (data as any).showPopup && (data as any).popupMessage) {
      const migratedPopup: PopupNotice = {
        id: crypto.randomUUID(),
        title: 'Notice',
        description: (data as any).popupMessage,
        media: [],
        color: '#f59e0b'
      };
      data.onChange?.({ popups: [migratedPopup] });
    } else if (!data.popups) {
      data.onChange?.({ popups: [] });
    }
    
    // Initialize media array if not present
    if (!data.media) {
      data.onChange?.({ media: [] });
    }
    
    // Migrate old popup media format
    if (data.popups) {
      const needsMigration = data.popups.some(p => typeof (p as any).media === 'string' || (p as any).media === undefined);
      if (needsMigration) {
        const migratedPopups = data.popups.map(p => ({
          ...p,
          media: typeof (p as any).media === 'string' ? [(p as any).media] : (Array.isArray(p.media) ? p.media : [])
        }));
        data.onChange?.({ popups: migratedPopups });
      }
    }
  }, [data]);

  // Local state for fast typing
  const [localTitle, setLocalTitle] = useState(data.title);
  const [localDesc, setLocalDesc] = useState(data.description);
  
  useEffect(() => { setLocalTitle(data.title); }, [data.title]);
  useEffect(() => { setLocalDesc(data.description); }, [data.description]);

  // Auto-grow textarea on mount and when description changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 500) + 'px';
    }
  }, [localDesc]);

  // Tell ReactFlow to recalculate handle positions when options change
  const optionIds = data.options?.map(o => o.id).join(',') ?? '';
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, optionIds, updateNodeInternals]);

  // Close menu when clicking outside
  useClickOutside([menuRef, containerRef], () => setActiveMenu('none'));

  const updateData = (updates: Partial<DynamicNodeData>) => {
    if (data.onChange) {
      data.onChange(updates);
    }
  };

  const handleToggleMenu = (menu: ActiveMenu) => {
    setActiveMenu(prev => prev === menu ? 'none' : menu);
  };

  const updateOption = (id: string, text: string) => {
    const newOptions = data.options.map(opt => opt.id === id ? { ...opt, text } : opt);
    updateData({ options: newOptions });
  };

  const removeOption = (id: string) => {
    updateData({ options: data.options.filter(opt => opt.id !== id) });
  };

  const updatePopup = (id: string, updates: Partial<PopupNotice>) => {
    const newPopups = (data.popups || []).map(p => p.id === id ? { ...p, ...updates } : p);
    updateData({ popups: newPopups });
  };

  const removePopup = (id: string) => {
    updateData({ popups: (data.popups || []).filter(p => p.id !== id) });
  };

  const addPopup = () => {
    if ((data.popups || []).length >= 10) return;
    const newPopup: PopupNotice = {
      id: crypto.randomUUID(),
      title: 'Notice',
      description: '',
      media: [],
      color: '#f59e0b'
    };
    updateData({ popups: [...(data.popups || []), newPopup] });
  };

  // Visual styles
  const gradientStyle = data.isColorized 
    ? { background: `linear-gradient(to top, ${data.color || '#f59e0b'} 2%, transparent 40%)` }
    : {};

  // Determine accent color
  const accentColor = data.isColorized ? (data.color || '#f59e0b') : ((data.options && data.options.length > 1) ? '#2F80ED' : '#C2C9DB');

  return (
    <div
      ref={containerRef}
      className="relative group transition-all duration-200 min-w-[220px] sm:min-w-[280px] w-max max-w-[90vw] sm:max-w-[400px]"
    >
      <div
        className="canvas-step-card relative rounded-xl transition-all"
        style={{
          borderColor: selected ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
          boxShadow: selected
            ? '0 0 0 2px var(--primary), 0 4px 16px rgba(47,128,237,0.15)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Top}
          className=""
          style={{
            width: 14, height: 14,
            left: '50%',
            top: -7,
            transform: 'translateX(-50%)',
            background: accentColor,
            border: '2px solid var(--card)',
            cursor: 'crosshair',
            zIndex: 10,
          }}
        />

        {/* Colorize Gradient Overlay */}
        {data.isColorized && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none z-0 opacity-40"
            style={gradientStyle}
          />
        )}

        <div className="relative z-10 px-4 pt-3 pb-2.5 flex flex-col gap-1.5">

          {/* Title & Description */}
          <div className="flex flex-col gap-0.5 nodrag cursor-text">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => {
                const newValue = e.target.value.slice(0, 100);
                setLocalTitle(newValue);
                updateData({ title: newValue });
              }}
              maxLength={100}
              className="font-semibold bg-transparent border-none p-0 focus:ring-0 text-[13px] leading-snug placeholder-slate-300 w-full"
              placeholder="Step Title"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}
            />
            <textarea
              ref={textareaRef}
              value={localDesc}
              onChange={(e) => {
                setLocalDesc(e.target.value);
                updateData({ description: e.target.value });
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 500) + 'px';
              }}
              className="text-[11px] bg-transparent border-none p-0 pr-1 focus:ring-0 resize-none min-h-[28px] placeholder-slate-300 leading-relaxed w-full overflow-y-auto custom-scrollbar"
              placeholder="Enter instructions..."
              style={{
                color: 'var(--muted)',
                maxHeight: '500px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 500) + 'px';
              }}
            />
          </div>

          {/* Feature Toolbar */}
          {data.editingEnabled !== false && (
          <div className="canvas-step-toolbar flex items-center gap-px mt-1 flex-wrap nodrag">
            <button
              onClick={() => handleToggleMenu('colorize')}
              className={`canvas-step-tool-btn ${data.isColorized ? 'active' : ''}`}
              title="Colorize Node"
              style={data.isColorized ? { '--tool-active-color': '#f59e0b' } as React.CSSProperties : undefined}
            >
              <Palette size={14} />
            </button>

            <button
              onClick={() => handleToggleMenu('input')}
              className={`canvas-step-tool-btn ${data.isInput ? 'active' : ''}`}
              title="Input Config"
              style={data.isInput ? { '--tool-active-color': '#2F80ED' } as React.CSSProperties : undefined}
            >
              <TextCursorInput size={14} />
            </button>

            <button
              onClick={() => handleToggleMenu('branching')}
              className={`canvas-step-tool-btn ${data.options && data.options.length > 1 ? 'active' : ''}`}
              title="Branching Config"
              style={data.options && data.options.length > 1 ? { '--tool-active-color': '#2F80ED' } as React.CSSProperties : undefined}
            >
              <GitFork size={14} />
            </button>

            <button
              onClick={() => handleToggleMenu('popup')}
              className={`canvas-step-tool-btn ${data.popups && data.popups.length > 0 ? 'active' : ''}`}
              title="Popup Config"
              style={data.popups && data.popups.length > 0 ? { '--tool-active-color': '#f59e0b' } as React.CSSProperties : undefined}
            >
              <MessageSquare size={14} />
            </button>

            <div className="canvas-step-tool-sep" />

            <button
              onClick={() => handleToggleMenu('checklist')}
              className={`canvas-step-tool-btn ${data.checklist && data.checklist.length > 0 ? 'active' : ''}`}
              style={data.checklist && data.checklist.length > 0 ? { '--tool-active-color': '#10b981' } as React.CSSProperties : undefined}
            >
              <ListChecks size={14} />
            </button>

            <button
              onClick={() => handleToggleMenu('media')}
              className={`canvas-step-tool-btn ${data.media && data.media.length > 0 ? 'active' : ''}`}
              title="Attach Media"
              style={data.media && data.media.length > 0 ? { '--tool-active-color': '#3b82f6' } as React.CSSProperties : undefined}
            >
              <ImageIcon size={14} />
            </button>
          </div>
          )}
        </div>

        {/* Floating Configuration Menus */}
        {activeMenu !== 'none' && (
          <div
            ref={menuRef}
            className="absolute top-full mt-2 left-0 sm:top-0 sm:left-full sm:ml-3 rounded-lg border p-4 z-50 min-w-[220px] sm:min-w-[240px] max-w-[calc(100vw-2rem)] sm:max-w-[280px] animate-in slide-in-from-left-2 duration-200"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--elevation-lg)',
            }}
          >
            {/* Colorize Menu */}
            {activeMenu === 'colorize' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Node Color</span>
                </div>
                <div className="flex gap-2.5 justify-start flex-wrap">
                  <button
                    onClick={() => updateData({ isColorized: false, color: undefined })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${!data.isColorized ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                    style={{ 
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                      ringColor: 'var(--foreground)'
                    }}
                    title="Default (No color)"
                  >
                    <span className="text-[10px] font-bold" style={{ color: 'var(--card)' }}>×</span>
                  </button>
                  {['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#64748b'].map(c => (
                    <button
                      key={c}
                      onClick={() => updateData({ isColorized: true, color: c })}
                      className={`w-7 h-7 rounded-full border transition-transform ${data.isColorized && data.color === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                      style={{ 
                        backgroundColor: c,
                        borderColor: 'var(--border)',
                        ringColor: 'var(--foreground)'
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Input Menu */}
            {activeMenu === 'input' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Input Required</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.isInput}
                      onChange={() => updateData({ isInput: !data.isInput })}
                      className="w-4 h-4 rounded border cursor-pointer accent-[var(--primary)]"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </label>
                </div>
                {data.isInput && (
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'text', label: 'Text Input', icon: Type },
                      { id: 'picture', label: 'Take Picture', icon: Camera },
                      { id: 'barcode', label: 'Scan Barcode', icon: ScanBarcode }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => updateData({ inputType: type.id as any })}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-colors hover:bg-secondary ${
                          data.inputType === type.id
                            ? 'font-medium border'
                            : ''
                        }`}
                        style={{
                          backgroundColor: data.inputType === type.id ? 'rgba(47, 128, 237, 0.1)' : 'transparent',
                          color: data.inputType === type.id ? 'var(--primary)' : 'var(--foreground)',
                          borderColor: data.inputType === type.id ? 'rgba(47, 128, 237, 0.2)' : 'transparent'
                        }}
                      >
                        <type.icon size={14} />
                        {type.label}
                        {data.inputType === type.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Branching Menu */}
            {activeMenu === 'branching' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Outputs</span>
                </div>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {data.options?.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono w-4 shrink-0" style={{ color: 'var(--muted)' }}>{idx+1}.</span>
                      <input 
                        value={opt.text}
                        onChange={(e) => updateOption(opt.id, e.target.value)}
                        className="flex-1 text-xs border rounded px-2.5 py-1.5 focus:outline-none canvas-input"
                        placeholder={idx === 0 ? "Default output" : "Option label"}
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--card)',
                          color: 'var(--foreground)',
                        }}
                      />
                      {idx > 0 && (
                        <button onClick={() => removeOption(opt.id)} className="p-1 hover:text-destructive transition-colors shrink-0" style={{ color: 'var(--muted)' }}>
                          <X size={14} />
                        </button>
                      )}
                      {idx === 0 && <div className="w-[30px]" />}
                    </div>
                  ))}
                  <button 
                    onClick={() => data.onAddOption?.()}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded transition-all border border-dashed mt-1 cursor-pointer canvas-media-btn"
                    style={{
                      color: 'var(--primary)',
                      borderColor: 'rgba(47, 128, 237, 0.3)'
                    }}
                  >
                    <Plus size={14} /> Add Option
                  </button>
                </div>
              </div>
            )}

            {/* Popup Menu */}
            {activeMenu === 'popup' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Popup Notices</span>
                  <div className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: 'var(--muted)', backgroundColor: 'var(--secondary)' }}>
                    {(data.popups || []).length} / 10
                  </div>
                </div>
                <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                  {(data.popups || []).map((popup, idx) => (
                    <div key={popup.id} className="flex flex-col gap-2 p-3 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{idx+1}.</span>
                        <input 
                          value={popup.title}
                          onChange={(e) => updatePopup(popup.id, { title: e.target.value })}
                          className="flex-1 text-xs font-semibold border-b bg-transparent px-1 py-0.5 focus:outline-none"
                          placeholder="Popup Title"
                          style={{
                            borderBottomColor: 'var(--border)',
                            color: 'var(--foreground)',
                          }}
                        />
                        <button onClick={() => removePopup(popup.id)} className="p-1 transition-colors shrink-0 canvas-icon-btn-danger"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <textarea
                        value={popup.description}
                        onChange={(e) => updatePopup(popup.id, { description: e.target.value })}
                        className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none resize-none canvas-input"
                        placeholder="Description..."
                        rows={2}
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--card)',
                          color: 'var(--foreground)'
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            data.onOpenMediaLibrary?.((selectedMedia) => {
                              updatePopup(popup.id, { media: [...popup.media, ...selectedMedia] });
                            });
                          }}
                          className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border canvas-config-btn"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--muted)',
                            backgroundColor: popup.media.length > 0 ? 'var(--secondary)' : 'transparent'
                          }}
                        >
                          <ImageIcon size={10} />
                          {popup.media.length > 0 ? `${popup.media.length} Media` : 'Add Media'}
                        </button>
                        <div className="flex gap-1 ml-auto">
                          {['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899'].map(c => (
                            <button
                              key={c}
                              onClick={() => updatePopup(popup.id, { color: c })}
                              className={`w-4 h-4 rounded-full border transition-transform ${popup.color === c ? 'ring-1 ring-offset-1 scale-110' : ''}`}
                              style={{ 
                                backgroundColor: c,
                                borderColor: 'var(--border)',
                                ringColor: 'var(--foreground)'
                              }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(data.popups || []).length < 10 && (
                    <button 
                      onClick={addPopup}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded transition-colors border border-dashed canvas-config-btn"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--muted)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <Plus size={14} /> Add Popup Notice
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Checklist Menu */}
            {activeMenu === 'checklist' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Checklist</span>
                  <div className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: 'var(--muted)', backgroundColor: 'var(--secondary)' }}>
                    {data.checklist?.filter(i => i.done).length || 0} / {data.checklist?.length || 0}
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {data.checklist?.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button 
                        onClick={() => updateData({ checklist: data.checklist.map(i => i.id === item.id ? { ...i, done: !i.done } : i) })}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white'}`}
                        style={{ borderColor: item.done ? '#10b981' : 'var(--border)' }}
                      >
                        {item.done && <Check size={9} />}
                      </button>
                      <input 
                        value={item.text}
                        onChange={(e) => updateData({ checklist: data.checklist.map(i => i.id === item.id ? { ...i, text: e.target.value } : i) })}
                        className={`flex-1 text-xs bg-transparent border-b border-transparent focus:border-b-[var(--border)] focus:outline-none py-1 ${item.done ? 'line-through' : ''}`}
                        style={{
                          color: item.done ? 'var(--muted)' : 'var(--foreground)',
                        }}
                      />
                      <button onClick={() => updateData({ checklist: data.checklist.filter(i => i.id !== item.id) })} className="p-1 transition-colors shrink-0 canvas-icon-btn-danger"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => updateData({ checklist: [...(data.checklist || []), { id: crypto.randomUUID(), text: 'Check item', done: false }] })}
                    className="flex items-center gap-1.5 text-xs transition-colors py-1 canvas-icon-btn hover:!text-emerald-500"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
              </div>
            )}

            {/* Media Menu */}
            {activeMenu === 'media' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Step Media</span>
                  {data.media && data.media.length > 0 && (
                    <div className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: 'var(--muted)', backgroundColor: 'var(--secondary)' }}>
                      {data.media.length} attached
                    </div>
                  )}
                </div>

                {/* Attached Media List */}
                {data.media && data.media.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                    {data.media.map((mediaId: string, idx: number) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 px-2 py-2 rounded border group"
                        style={{
                          backgroundColor: 'var(--secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ImageIcon size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          <span className="text-xs truncate" style={{ color: 'var(--foreground)' }}>
                            {mediaId.split('-').pop() || `Media ${idx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={() => {
                                const newMedia = [...data.media];
                                [newMedia[idx], newMedia[idx - 1]] = [newMedia[idx - 1], newMedia[idx]];
                                updateData({ media: newMedia });
                              }}
                              className="p-1 rounded transition-colors canvas-move-btn"
                              title="Move up"
                            >
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M18 15l-6-6-6 6" />
                              </svg>
                            </button>
                          )}
                          {idx < data.media.length - 1 && (
                            <button
                              onClick={() => {
                                const newMedia = [...data.media];
                                [newMedia[idx], newMedia[idx + 1]] = [newMedia[idx + 1], newMedia[idx]];
                                updateData({ media: newMedia });
                              }}
                              className="p-1 rounded transition-colors canvas-move-btn"
                              title="Move down"
                            >
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => updateData({ media: data.media.filter((_, i) => i !== idx) })}
                            className="p-1 rounded transition-colors canvas-icon-btn-danger"
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label
                    className="flex items-center gap-2 px-3 py-2.5 rounded text-xs transition-colors border cursor-pointer canvas-upload-btn"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <ImageIcon size={14} />
                    Upload Media
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          // Generate mock IDs for uploaded files
                          const newMediaIds = files.map((file) => `upload-${Date.now()}-${file.name}`);
                          updateData({ media: [...(data.media || []), ...newMediaIds] });
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      data.onOpenMediaLibrary?.((selectedMedia) => {
                        updateData({ media: [...(data.media || []), ...selectedMedia] });
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded text-xs font-medium transition-colors border canvas-media-btn"
                    style={{
                      color: 'var(--primary)',
                      borderColor: 'rgba(47, 128, 237, 0.2)'
                    }}
                  >
                    <ImageIcon size={14} />
                    Select from Library
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Source handle dots — direct children of the card so ReactFlow can compute their position */}
        {data.options?.map((opt, index) => {
          const total = data.options.length;
          const leftPct = total === 1 ? 50 : 8 + (index / (total - 1)) * 84;
          return (
            <Handle
              key={opt.id}
              type="source"
              position={Position.Bottom}
              id={opt.id}
              className=""
              style={{
                width: 14, height: 14,
                left: `${leftPct}%`,
                bottom: -7,
                transform: 'translateX(-50%)',
                background: total === 1 ? accentColor : 'var(--primary)',
                border: '2px solid var(--card)',
                cursor: 'crosshair',
                zIndex: 10,
              }}
            />
          );
        })}

        {/* Labels and add-step buttons below the handle dots */}
        {data.options && data.options.length > 0 && (
          <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: '100%', overflow: 'visible' }}>
            {data.options.map((opt, index) => {
              const total = data.options.length;
              const leftPct = total === 1 ? 50 : 8 + (index / (total - 1)) * 84;
              const isConnected = data.connectedHandles?.has(opt.id);
              const isSingle = total === 1;
              return (
                <div key={opt.id} className="absolute pointer-events-auto" style={{ left: `${leftPct}%`, top: 0, transform: 'translateX(-50%)' }}>
                  {!isSingle && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-center whitespace-nowrap max-w-[72px] truncate"
                      style={{ top: 8, backgroundColor: 'rgba(47, 128, 237, 0.08)', color: 'var(--primary)' }}
                      title={opt.text}
                    >
                      {opt.text}
                    </div>
                  )}
                  {!isConnected && data.editingEnabled !== false && (
                    <button
                      onClick={(e) => { e.stopPropagation(); data.onAddConnectedStep?.(opt.id); }}
                      className={`absolute left-1/2 -translate-x-1/2 rounded-full border flex items-center justify-center transition-all hover:scale-110 nodrag canvas-add-btn ${
                        isSingle
                          ? 'w-9 h-9 opacity-30 hover:opacity-100'
                          : 'w-8 h-8 opacity-0 group-hover:opacity-40 hover:!opacity-100'
                      }`}
                      style={{ top: isSingle ? 8 : 32 }}
                      title="Add connected step"
                    >
                      <Plus size={isSingle ? 16 : 14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hover Action Menu */}
        {data.editingEnabled !== false && (
        <div className="canvas-step-actions absolute -top-3 right-3 flex gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
          <button onClick={() => data.onAction?.('duplicate')} className="canvas-step-action-btn" title="Duplicate">
            <Copy size={12} />
          </button>
          <button onClick={() => data.onAction?.('delete')} className="canvas-step-action-btn danger" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
