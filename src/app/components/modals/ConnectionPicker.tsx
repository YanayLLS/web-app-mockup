import { useState, useRef, useEffect } from 'react';
import { Search, Link as LinkIcon, X, Check } from 'lucide-react';
import { KnowledgeBaseItem } from '../../../types';
import { useProject } from '../../contexts/ProjectContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useRole, hasAccess } from '../../contexts/RoleContext';

interface ConnectionPickerProps {
  item: KnowledgeBaseItem;
  onClose: () => void;
  position: { top: number; left: number };
}

export function ConnectionPicker({ item, onClose, position }: ConnectionPickerProps) {
  const { digitalTwins, knowledgeBaseItems, updateKnowledgeBaseItem, getConnectedProcedures } = useProject();
  const { currentRole } = useRole();
  const canEdit = hasAccess(currentRole, 'projects-edit');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useClickOutside(pickerRef, onClose);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // For procedures: show digital twins with checkboxes (multiple selection)
  if (item.type === 'procedure') {
    const filteredTwins = digitalTwins.filter(twin =>
      twin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const connectedTwinIds = item.connectedDigitalTwinIds || [];

    const handleToggleTwin = (twinId: string) => {
      const isCurrentlyConnected = connectedTwinIds.includes(twinId);
      const newConnectedIds = isCurrentlyConnected
        ? connectedTwinIds.filter(id => id !== twinId)
        : [...connectedTwinIds, twinId];
      
      updateKnowledgeBaseItem(item.id, {
        ...item,
        connectedDigitalTwinIds: newConnectedIds.length > 0 ? newConnectedIds : undefined,
      });
    };

    return (
      <div
        ref={pickerRef}
        className="fixed bg-card border border-border rounded-[var(--radius)] shadow-lg z-50 w-80 max-w-[calc(100vw-32px)]"
        style={{
          top: `${position.top}px`,
          left: `${Math.min(position.left, window.innerWidth - 336)}px`,
          boxShadow: 'var(--elevation-md)',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Connected Digital Twins
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-[var(--radius)] transition-colors"
            >
              <X size={14} className="text-muted" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search digital twins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-secondary border border-border rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {filteredTwins.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">No digital twins found</p>
            </div>
          ) : (
            filteredTwins.map(twin => {
              const isConnected = connectedTwinIds.includes(twin.id);
              
              return (
                <div
                  key={twin.id}
                  onClick={() => canEdit && handleToggleTwin(twin.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-foreground transition-colors ${canEdit ? 'hover:bg-secondary cursor-pointer' : 'cursor-default opacity-50'}`}
                >
                  <div className="w-4 h-4 flex items-center justify-center border border-border rounded transition-colors shrink-0 pointer-events-none"
                    style={{
                      backgroundColor: isConnected ? 'var(--color-primary)' : 'transparent',
                      borderColor: isConnected ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    {isConnected && <Check size={12} className="text-primary-foreground" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
                    <LinkIcon size={14} className="text-accent shrink-0" />
                    <span className="text-sm truncate">{twin.name}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with count */}
        {connectedTwinIds.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-secondary/30">
            <p className="text-xs text-muted">
              {connectedTwinIds.length} {connectedTwinIds.length === 1 ? 'digital twin' : 'digital twins'} connected
            </p>
          </div>
        )}
      </div>
    );
  }

  // For digital twins: show procedures with checkboxes
  if (item.type === 'digital-twin') {
    // Get the actual digital twin ID (either from digitalTwinId field or fallback to item.id)
    const actualDigitalTwinId = item.digitalTwinId || item.id;
    
    const procedures = knowledgeBaseItems.filter(i => i.type === 'procedure');
    const filteredProcedures = procedures.filter(proc =>
      proc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const connectedProcedures = getConnectedProcedures(actualDigitalTwinId);
    const connectedProcedureIds = connectedProcedures.map(proc => proc.id);

    const handleToggleProcedure = (procedureId: string) => {
      const procedure = knowledgeBaseItems.find(i => i.id === procedureId);
      if (!procedure) return;

      const currentConnections = procedure.connectedDigitalTwinIds || [];
      const isCurrentlyConnected = currentConnections.includes(actualDigitalTwinId);
      
      const newConnections = isCurrentlyConnected
        ? currentConnections.filter(id => id !== actualDigitalTwinId)
        : [...currentConnections, actualDigitalTwinId];

      updateKnowledgeBaseItem(procedureId, {
        ...procedure,
        connectedDigitalTwinIds: newConnections.length > 0 ? newConnections : undefined,
      });
    };

    return (
      <div
        ref={pickerRef}
        className="fixed bg-card border border-border rounded-[var(--radius)] shadow-lg z-50 w-96 max-w-[calc(100vw-32px)]"
        style={{
          top: `${position.top}px`,
          left: `${Math.min(position.left, window.innerWidth - 400)}px`,
          boxShadow: 'var(--elevation-md)',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Connected Flows
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-[var(--radius)] transition-colors"
            >
              <X size={14} className="text-muted" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-secondary border border-border rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {filteredProcedures.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted">No procedures found</p>
            </div>
          ) : (
            filteredProcedures.map(procedure => {
              const isConnected = (procedure.connectedDigitalTwinIds || []).includes(actualDigitalTwinId);
              
              return (
                <div
                  key={procedure.id}
                  onClick={() => canEdit && handleToggleProcedure(procedure.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-foreground transition-colors ${canEdit ? 'hover:bg-secondary cursor-pointer' : 'cursor-default opacity-50'}`}
                >
                  <div className="w-4 h-4 flex items-center justify-center border border-border rounded transition-colors shrink-0 pointer-events-none"
                    style={{
                      backgroundColor: isConnected ? 'var(--color-primary)' : 'transparent',
                      borderColor: isConnected ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    {isConnected && <Check size={12} className="text-primary-foreground" />}
                  </div>
                  <span className="text-sm truncate pointer-events-none">{procedure.name}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with count */}
        {connectedProcedureIds.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-secondary/30">
            <p className="text-xs text-muted">
              {connectedProcedureIds.length} {connectedProcedureIds.length === 1 ? 'flow' : 'flows'} connected
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
