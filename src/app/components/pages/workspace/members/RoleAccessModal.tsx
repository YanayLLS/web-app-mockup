import { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Folder, FileText, Info } from 'lucide-react';
import { Checkbox } from './Checkbox';

interface ContentNode {
  id: string;
  name: string;
  type: 'folder' | 'item';
  items?: ContentNode[];
}

interface RoleAccessModalProps {
  projectName: string;
  roleName: string;
  contentTree: ContentNode[];
  roleAccessRules: { [contentId: string]: string[] };
  onClose: () => void;
  onSave: (updatedRules: { [contentId: string]: string[] }) => void;
}

export function RoleAccessModal({
  projectName,
  roleName,
  contentTree,
  roleAccessRules,
  onClose,
  onSave,
}: RoleAccessModalProps) {
  const [accessRules, setAccessRules] = useState<{ [contentId: string]: string[] }>(roleAccessRules);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize with all folders expanded
  useEffect(() => {
    const folderIds = contentTree
      .filter(item => item.type === 'folder')
      .map(item => item.id);
    setExpanded(folderIds);
  }, [contentTree]);

  const toggleExpand = (id: string) => {
    setExpanded(prev =>
      prev.includes(id)
        ? prev.filter(nodeId => nodeId !== id)
        : [...prev, id]
    );
  };

  const hasAccess = (contentId: string): boolean => {
    return (accessRules[contentId] || []).includes(roleName);
  };

  const toggleAccess = (contentId: string) => {
    setAccessRules(prev => {
      const currentRoles = prev[contentId] || [];
      const hasCurrentAccess = currentRoles.includes(roleName);

      if (hasCurrentAccess) {
        // Remove access
        return {
          ...prev,
          [contentId]: currentRoles.filter(r => r !== roleName),
        };
      } else {
        // Grant access
        return {
          ...prev,
          [contentId]: [...currentRoles, roleName],
        };
      }
    });
  };

  // Get all descendant IDs for cascading selection
  const getAllDescendantIds = (node: ContentNode): string[] => {
    const ids = [node.id];
    if (node.items) {
      node.items.forEach(child => {
        ids.push(...getAllDescendantIds(child));
      });
    }
    return ids;
  };

  const handleToggleWithCascade = (node: ContentNode) => {
    const allIds = getAllDescendantIds(node);
    const willGrantAccess = !hasAccess(node.id);

    setAccessRules(prev => {
      const newRules = { ...prev };
      allIds.forEach(id => {
        const currentRoles = newRules[id] || [];
        if (willGrantAccess) {
          // Grant access to all
          if (!currentRoles.includes(roleName)) {
            newRules[id] = [...currentRoles, roleName];
          }
        } else {
          // Remove access from all
          newRules[id] = currentRoles.filter(r => r !== roleName);
        }
      });
      return newRules;
    });
  };

  // Check if node or any child matches search
  const nodeMatchesSearch = (node: ContentNode): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (node.name.toLowerCase().includes(query)) {
      return true;
    }

    if (node.items) {
      return node.items.some(child => nodeMatchesSearch(child));
    }

    return false;
  };

  // Filter tree based on search
  const filteredTree = contentTree.filter(node => nodeMatchesSearch(node));

  // Auto-expand nodes that match search
  useEffect(() => {
    if (searchQuery) {
      const toExpand: string[] = [];
      const checkAndExpand = (node: ContentNode) => {
        if (node.items) {
          const hasMatchingChild = node.items.some(child => nodeMatchesSearch(child));
          if (hasMatchingChild) {
            toExpand.push(node.id);
            node.items.forEach(child => checkAndExpand(child));
          }
        }
      };

      contentTree.forEach(node => checkAndExpand(node));
      setExpanded(toExpand);
    }
  }, [searchQuery, contentTree]);

  // Count total items and accessible items
  const countItems = () => {
    let total = 0;
    let accessible = 0;

    const countNode = (node: ContentNode) => {
      total++;
      if (hasAccess(node.id)) {
        accessible++;
      }
      if (node.items) {
        node.items.forEach(child => countNode(child));
      }
    };

    contentTree.forEach(node => countNode(node));
    return { total, accessible };
  };

  const { total, accessible } = countItems();

  const handleSelectAll = () => {
    const allIds: string[] = [];
    const collectIds = (node: ContentNode) => {
      allIds.push(node.id);
      if (node.items) {
        node.items.forEach(child => collectIds(child));
      }
    };
    contentTree.forEach(node => collectIds(node));

    setAccessRules(prev => {
      const newRules = { ...prev };
      allIds.forEach(id => {
        const currentRoles = newRules[id] || [];
        if (!currentRoles.includes(roleName)) {
          newRules[id] = [...currentRoles, roleName];
        }
      });
      return newRules;
    });
  };

  const handleDeselectAll = () => {
    const allIds: string[] = [];
    const collectIds = (node: ContentNode) => {
      allIds.push(node.id);
      if (node.items) {
        node.items.forEach(child => collectIds(child));
      }
    };
    contentTree.forEach(node => collectIds(node));

    setAccessRules(prev => {
      const newRules = { ...prev };
      allIds.forEach(id => {
        newRules[id] = (newRules[id] || []).filter(r => r !== roleName);
      });
      return newRules;
    });
  };

  const renderNode = (node: ContentNode, depth: number = 0) => {
    const isExpanded = expanded.includes(node.id);
    const nodeHasAccess = hasAccess(node.id);
    const isFolder = node.type === 'folder';

    if (!nodeMatchesSearch(node)) return null;

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-2 px-2 rounded-[var(--radius-md)] hover:bg-secondary/50 transition-colors"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {isFolder && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="flex-shrink-0 p-0.5"
            >
              <ChevronRight
                className="w-4 h-4 transition-transform"
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  color: 'var(--muted-foreground)',
                }}
              />
            </button>
          )}
          {!isFolder && <div className="w-5" />}

          <button
            onClick={() => handleToggleWithCascade(node)}
            className="flex-1 flex items-center gap-2 text-left"
          >
            {isFolder ? (
              <Folder className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            ) : (
              <FileText className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            )}
            <span
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {node.name}
            </span>
          </button>

          <Checkbox
            checked={nodeHasAccess}
            onChange={() => handleToggleWithCascade(node)}
            blocked={true}
            label=""
          />
        </div>

        {isFolder && isExpanded && node.items && (
          <div>
            {node.items.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-card rounded-lg flex flex-col max-h-[80vh] w-full max-w-2xl"
        style={{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevation-lg)',
        }}
      >
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Configure Access for {roleName}
              </h3>
              <p
                className="text-xs mt-1"
                style={{
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {projectName} • {accessible}/{total} items accessible
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info Banner */}
          <div
            className="flex items-start gap-2 p-3 rounded"
            style={{
              backgroundColor: 'var(--primary-background)',
              borderRadius: 'var(--radius)',
            }}
          >
            <Info className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
            <div className="flex-1">
              <p
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Select which folders and items members with the <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{roleName}</span> role can access. Selecting a folder grants access to all its contents.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search folders and items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius)',
              }}
            />
          </div>

          {/* Select All / Deselect All */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-left"
              style={{
                color: 'var(--primary)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Select All
            </button>
            <span style={{ color: 'var(--muted-foreground)' }}>•</span>
            <button
              onClick={handleDeselectAll}
              className="px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-left"
              style={{
                color: 'var(--primary)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Deselect All
            </button>
          </div>

          {/* Content Tree */}
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredTree.length > 0 ? (
              <div className="space-y-1">
                {filteredTree.map(node => renderNode(node))}
              </div>
            ) : (
              <div
                className="text-center py-8"
                style={{
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                No items match your search
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(accessRules)}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
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
