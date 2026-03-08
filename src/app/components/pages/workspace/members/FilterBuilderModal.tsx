import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ProjectAccessModal } from './ProjectAccessModal';

export interface FilterRule {
  id: string;
  field: 'group' | 'role' | 'access';
  operator: 'is' | 'is not';
  value: string | string[]; // Support both string and array for access field
}

export interface FilterGroup {
  id: string;
  rules: FilterRule[];
  scope: 'any' | 'all'; // Any = OR, All = AND
}

interface FilterBuilderModalProps {
  onClose: () => void;
  onApply: (filterGroups: FilterGroup[]) => void;
  availableGroups: Array<{ name: string; color: string }>;
  availableRoles: Array<{ name: string; description: string }>;
  availableProjects: string[];
  initialFilters?: FilterGroup[];
}

export function FilterBuilderModal({
  onClose,
  onApply,
  availableGroups,
  availableRoles,
  availableProjects,
  initialFilters = [],
}: FilterBuilderModalProps) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(
    initialFilters.length > 0
      ? initialFilters
      : [{ id: Date.now().toString(), rules: [], scope: 'any' }]
  );
  
  // State for access hierarchy modal
  const [showAccessModal, setShowAccessModal] = useState<{ groupId: string; ruleId: string } | null>(null);

  const addFilterGroup = () => {
    setFilterGroups([
      ...filterGroups,
      { id: Date.now().toString(), rules: [], scope: 'any' },
    ]);
  };

  const removeFilterGroup = (groupId: string) => {
    setFilterGroups(filterGroups.filter((g) => g.id !== groupId));
  };

  const addRule = (groupId: string) => {
    setFilterGroups(
      filterGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: [
                ...group.rules,
                {
                  id: Date.now().toString(),
                  field: 'group',
                  operator: 'is',
                  value: '',
                },
              ],
            }
          : group
      )
    );
  };

  const removeRule = (groupId: string, ruleId: string) => {
    setFilterGroups(
      filterGroups.map((group) =>
        group.id === groupId
          ? { ...group, rules: group.rules.filter((r) => r.id !== ruleId) }
          : group
      )
    );
  };

  const updateRule = (
    groupId: string,
    ruleId: string,
    updates: Partial<FilterRule>
  ) => {
    setFilterGroups(
      filterGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
              ),
            }
          : group
      )
    );
  };

  const updateScope = (groupId: string, scope: 'any' | 'all') => {
    setFilterGroups(
      filterGroups.map((group) =>
        group.id === groupId ? { ...group, scope } : group
      )
    );
  };

  const getValueOptions = (field: 'group' | 'role' | 'access') => {
    switch (field) {
      case 'group':
        return availableGroups.map((g) => g.name);
      case 'role':
        return availableRoles.map((r) => r.name);
      case 'access':
        return availableProjects;
      default:
        return [];
    }
  };

  const handleApply = () => {
    // Filter out empty filter groups
    const validGroups = filterGroups.filter((g) => g.rules.length > 0);
    onApply(validGroups);
  };

  const handleClear = () => {
    setFilterGroups([{ id: Date.now().toString(), rules: [], scope: 'any' }]);
  };

  const totalRules = filterGroups.reduce((sum, g) => sum + g.rules.length, 0);

  // Helper function to get access selection counts
  const getAccessCounts = (accessIds: string[]) => {
    if (!Array.isArray(accessIds) || accessIds.length === 0) {
      return { projects: 0, folders: 0, items: 0, total: 0 };
    }

    const counts = { projects: 0, folders: 0, items: 0, total: 0 };
    
    accessIds.forEach((id) => {
      if (id.startsWith('p') && !id.includes('f') && !id.includes('i')) {
        counts.projects++;
      } else if (id.includes('f') && !id.includes('i')) {
        counts.folders++;
      } else if (id.includes('i')) {
        counts.items++;
      }
      counts.total++;
    });
    
    return counts;
  };

  // Helper to format access display text
  const formatAccessDisplay = (accessIds: string | string[]) => {
    if (!Array.isArray(accessIds)) return 'Select access...';
    
    const counts = getAccessCounts(accessIds);
    if (counts.total === 0) return 'Select access...';
    
    const parts = [];
    if (counts.projects > 0) parts.push(`${counts.projects} project${counts.projects !== 1 ? 's' : ''}`);
    if (counts.folders > 0) parts.push(`${counts.folders} folder${counts.folders !== 1 ? 's' : ''}`);
    if (counts.items > 0) parts.push(`${counts.items} item${counts.items !== 1 ? 's' : ''}`);
    
    return parts.join(', ');
  };

  // Handle access modal save
  const handleAccessSave = (groupId: string, ruleId: string, projectIds: string[]) => {
    updateRule(groupId, ruleId, { value: projectIds });
    setShowAccessModal(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-elevation-lg w-[700px] max-h-[80vh] flex flex-col"
        style={{ border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Filter Builder
            </h2>
            <p
              className="mt-1"
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Create complex filters to refine your member list
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {filterGroups.map((group, groupIndex) => (
              <div key={group.id}>
                {/* Group Connector */}
                {groupIndex > 0 && (
                  <div className="flex items-center justify-center my-2">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--foreground)',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      OR
                    </div>
                  </div>
                )}

                {/* Filter Group */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: 'var(--foreground)',
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        Match
                      </span>
                      <select
                        value={group.scope}
                        onChange={(e) =>
                          updateScope(group.id, e.target.value as 'any' | 'all')
                        }
                        className="px-2 py-1 rounded border text-xs"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--card)',
                          color: 'var(--foreground)',
                          fontFamily: 'var(--font-family)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <option value="any">Any</option>
                        <option value="all">All</option>
                      </select>
                      <span
                        style={{
                          color: 'var(--foreground)',
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        of the following rules
                      </span>
                    </div>
                    {filterGroups.length > 1 && (
                      <button
                        onClick={() => removeFilterGroup(group.id)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        <Trash2
                          className="w-4 h-4"
                          style={{ color: 'var(--destructive)' }}
                        />
                      </button>
                    )}
                  </div>

                  {/* Rules */}
                  <div className="flex flex-col gap-2">
                    {group.rules.map((rule, ruleIndex) => (
                      <div key={rule.id}>
                        {/* Rule Connector */}
                        {ruleIndex > 0 && (
                          <div className="flex items-center py-1">
                            <div
                              className="text-xs font-medium"
                              style={{
                                color: 'var(--muted)',
                                fontFamily: 'var(--font-family)',
                              }}
                            >
                              {group.scope === 'any' ? 'OR' : 'AND'}
                            </div>
                          </div>
                        )}

                        {/* Rule Row */}
                        <div className="flex items-center gap-2">
                          {/* Field */}
                          <select
                            value={rule.field}
                            onChange={(e) =>
                              updateRule(group.id, rule.id, {
                                field: e.target.value as 'group' | 'role' | 'access',
                                value: '', // Reset value when field changes
                              })
                            }
                            className="px-3 py-2 rounded border text-sm flex-1"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundColor: 'var(--card)',
                              color: 'var(--foreground)',
                              fontFamily: 'var(--font-family)',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            <option value="group">Group</option>
                            <option value="role">Role</option>
                            <option value="access">Access</option>
                          </select>

                          {/* Operator */}
                          <select
                            value={rule.operator}
                            onChange={(e) =>
                              updateRule(group.id, rule.id, {
                                operator: e.target.value as 'is' | 'is not',
                              })
                            }
                            className="px-3 py-2 rounded border text-sm flex-1"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundColor: 'var(--card)',
                              color: 'var(--foreground)',
                              fontFamily: 'var(--font-family)',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            <option value="is">is</option>
                            <option value="is not">is not</option>
                          </select>

                          {/* Value */}
                          {rule.field === 'access' ? (
                            // Custom button for access field that opens hierarchy modal
                            <button
                              onClick={() => setShowAccessModal({ groupId: group.id, ruleId: rule.id })}
                              className="px-3 py-2 rounded border text-sm flex-1 text-left hover:bg-secondary transition-colors"
                              style={{
                                borderColor: 'var(--border)',
                                backgroundColor: 'var(--card)',
                                color: Array.isArray(rule.value) && rule.value.length > 0 ? 'var(--foreground)' : 'var(--muted)',
                                fontFamily: 'var(--font-family)',
                                borderRadius: 'var(--radius)',
                              }}
                            >
                              {formatAccessDisplay(rule.value)}
                            </button>
                          ) : (
                            // Regular select for group and role fields
                            <select
                              value={typeof rule.value === 'string' ? rule.value : ''}
                              onChange={(e) =>
                                updateRule(group.id, rule.id, {
                                  value: e.target.value,
                                })
                              }
                              className="px-3 py-2 rounded border text-sm flex-1"
                              style={{
                                borderColor: 'var(--border)',
                                backgroundColor: 'var(--card)',
                                color: 'var(--foreground)',
                                fontFamily: 'var(--font-family)',
                                borderRadius: 'var(--radius)',
                              }}
                            >
                              <option value="">Select {rule.field}...</option>
                              {getValueOptions(rule.field).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Delete Rule */}
                          <button
                            onClick={() => removeRule(group.id, rule.id)}
                            className="p-2 hover:bg-secondary rounded transition-colors"
                          >
                            <Trash2
                              className="w-4 h-4"
                              style={{ color: 'var(--muted)' }}
                            />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Rule Button */}
                    <button
                      onClick={() => addRule(group.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded border border-dashed hover:bg-secondary transition-colors mt-2"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Rule</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Filter Group Button */}
            <button
              onClick={addFilterGroup}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-dashed hover:bg-secondary transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--primary)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Filter Group</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {totalRules} rule{totalRules !== 1 ? 's' : ''} defined
            </span>
            {totalRules > 0 && (
              <button
                onClick={handleClear}
                className="text-xs hover:underline"
                style={{
                  color: 'var(--destructive)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-secondary transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Project Access Modal */}
      {showAccessModal && (() => {
        const group = filterGroups.find(g => g.id === showAccessModal.groupId);
        const rule = group?.rules.find(r => r.id === showAccessModal.ruleId);
        
        if (!rule) return null;
        
        const currentProjects = Array.isArray(rule.value) ? rule.value : [];
        
        return (
          <ProjectAccessModal
            currentProjects={currentProjects}
            memberGroups={[]}
            onClose={() => setShowAccessModal(null)}
            onSave={(projectIds) => handleAccessSave(showAccessModal.groupId, showAccessModal.ruleId, projectIds)}
            isFilterMode={true}
          />
        );
      })()}
    </div>
  );
}