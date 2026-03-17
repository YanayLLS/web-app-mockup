import { useState, useMemo } from 'react';
import { X, Search, Shield } from 'lucide-react';
import { MOCK_CONFIGURATIONS } from '../../../data/configurationsData';
import type { Configuration } from '../../../data/configurationsData';
import { useRole } from '../../../contexts/RoleContext';

interface AppConfigurationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (configId: string, configName: string) => void;
}

export function AppConfigurationSelector({ isOpen, onClose, onSelect }: AppConfigurationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentRole } = useRole();

  // Filter: only enabled configs permitted for current role
  const availableConfigs = useMemo(() => {
    return MOCK_CONFIGURATIONS.filter((c) => {
      if (!c.isEnabled) return false;
      if (!c.permittedRoles.includes(currentRole)) return false;
      return true;
    });
  }, [currentRole]);

  // Default config is always pre-selected — no "None" option
  const defaultConfig = availableConfigs.find((c) => c.isDefault);
  const [selectedId, setSelectedId] = useState<string | null>(defaultConfig?.id ?? availableConfigs[0]?.id ?? null);

  // Search filter by name, description, or tags
  const filteredConfigs = useMemo(() => {
    if (!searchQuery.trim()) return availableConfigs;
    const q = searchQuery.toLowerCase();
    return availableConfigs.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [availableConfigs, searchQuery]);

  const handleOpen = () => {
    if (!selectedId) return;
    const config = availableConfigs.find((c) => c.id === selectedId);
    if (config) {
      onSelect(config.id, config.name);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/35 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
        <div
          className="pointer-events-auto flex flex-col w-full sm:w-[480px]"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E9E9E9',
            borderRadius: '14px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              padding: '18px 18px 14px 18px',
              borderBottom: '1px solid #E9E9E9',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(47, 128, 237, 0.08)',
                }}
              >
                <Shield style={{ width: '14px', height: '14px', color: '#2F80ED' }} />
              </div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: '#36415D',
                  margin: 0,
                }}
              >
                Select Configuration
              </h3>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              aria-label="Close"
            >
              <X style={{ width: '14px', height: '14px', color: '#868D9E' }} />
            </button>
          </div>

          {/* Search */}
          <div className="shrink-0" style={{ padding: '12px 18px 8px 18px' }}>
            <div
              className="flex items-center transition-all"
              style={{
                backgroundColor: '#F5F5F5',
                borderRadius: '10px',
                border: '1px solid #E9E9E9',
                padding: '0 12px',
                height: '38px',
              }}
            >
              <Search style={{ width: '14px', height: '14px', color: '#C2C9DB', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or tag..."
                className="flex-1 outline-none bg-transparent"
                style={{
                  fontSize: '13px',
                  color: '#36415D',
                  border: 'none',
                  marginLeft: '8px',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:bg-white/60 rounded-md p-1 transition-colors"
                >
                  <X style={{ width: '12px', height: '12px', color: '#868D9E' }} />
                </button>
              )}
            </div>
          </div>

          {/* Configuration list */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: '6px 18px 10px 18px' }}
          >
            {filteredConfigs.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  padding: '36px 16px',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Search style={{ width: '16px', height: '16px', color: '#C2C9DB' }} />
                </div>
                <span style={{ fontSize: '13px', color: '#868D9E' }}>
                  {searchQuery ? 'No configurations match your search' : 'No configurations available'}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredConfigs.map((config) => (
                  <SelectorConfigItem
                    key={config.id}
                    config={config}
                    isSelected={selectedId === config.id}
                    onSelect={() => setSelectedId(config.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end shrink-0"
            style={{
              padding: '14px 18px',
              borderTop: '1px solid #E9E9E9',
              gap: '10px',
            }}
          >
            <button
              onClick={onClose}
              className="hover:bg-[#F5F5F5] active:scale-[0.97] transition-all"
              style={{
                padding: '9px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 'var(--font-weight-semibold)',
                color: '#36415D',
                border: '1px solid #C2C9DB',
                backgroundColor: 'white',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleOpen}
              disabled={!selectedId}
              className="active:scale-[0.97] transition-all"
              style={{
                padding: '9px 28px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 'var(--font-weight-bold)',
                color: 'white',
                backgroundColor: '#2F80ED',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(47,128,237,0.25)',
              }}
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SelectorConfigItem({
  config,
  isSelected,
  onSelect,
}: {
  config: Configuration;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left transition-all hover:shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '10px',
        border: isSelected ? '2px solid #2F80ED' : '1px solid #E9E9E9',
        backgroundColor: isSelected ? 'rgba(47, 128, 237, 0.04)' : '#FFFFFF',
        cursor: 'pointer',
      }}
    >
      {/* Radio circle */}
      <div
        className="shrink-0 transition-all"
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: isSelected ? '2px solid #2F80ED' : '2px solid #C2C9DB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2px',
          boxShadow: isSelected ? '0 0 0 3px rgba(47,128,237,0.1)' : undefined,
        }}
      >
        {isSelected && (
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2F80ED',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="truncate"
            style={{
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
              color: isSelected ? '#2F80ED' : '#36415D',
            }}
          >
            {config.name}
          </span>
          {config.isDefault && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'var(--font-weight-semibold)',
                color: '#2F80ED',
                backgroundColor: 'rgba(47, 128, 237, 0.08)',
                padding: '2px 7px',
                borderRadius: '99px',
                whiteSpace: 'nowrap',
                letterSpacing: '0.2px',
              }}
            >
              Default
            </span>
          )}
        </div>
        <p
          className="line-clamp-2"
          style={{
            fontSize: '12px',
            color: '#868D9E',
            margin: '3px 0 8px 0',
            lineHeight: '1.5',
          }}
        >
          {config.description}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap" style={{ gap: '4px' }}>
          {config.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: isSelected ? '#2F80ED' : '#868D9E',
                backgroundColor: isSelected ? 'rgba(47,128,237,0.06)' : '#F5F5F5',
                padding: '2px 8px',
                borderRadius: '99px',
                border: `1px solid ${isSelected ? 'rgba(47,128,237,0.12)' : '#E9E9E9'}`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
