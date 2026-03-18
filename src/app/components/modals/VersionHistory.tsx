import { useState, useRef } from 'react';
import { ChevronDown, MoreHorizontal, RotateCcw, Eye, FileText, History } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { MemberAvatar } from '../MemberAvatar';

interface Version {
  version: string;
  publishDate: string;
  publishedBy: string;
  publishedByInitials: string;
  publishedByColor: string;
}

interface VersionHistoryProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  versions: Version[];
}

export function VersionHistory({
  isExpanded,
  onToggleExpand,
  versions,
}: VersionHistoryProps) {
  const { currentRole } = useRole();
  const canRollback = hasAccess(currentRole, 'publish-content');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useClickOutside(menuRef, () => setActiveMenu(null));

  const handleRollback = (index: number) => {
    console.log('Rollback to version:', versions[index].version);
    setActiveMenu(null);
  };

  const handlePreview = (index: number) => {
    console.log('Preview version:', versions[index].version);
    setActiveMenu(null);
  };

  const handleViewChanges = (index: number) => {
    console.log('View changes for version:', versions[index].version);
    setActiveMenu(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-secondary/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <History size={15} className="text-[#8B5CF6] shrink-0" />
        <span className="text-sm text-foreground flex-1 text-left" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Version History
        </span>
        {!isExpanded && versions.length > 0 && (
          <span className="text-[10px] text-muted bg-secondary rounded-full px-2 py-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {versions.length}
          </span>
        )}
        <ChevronDown size={14} className={`text-muted transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/40">
          {/* Column Headers */}
          <div className="flex items-center gap-1.5 px-1.5 py-2.5 text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            <div className="w-14 shrink-0">Version</div>
            <div className="flex-1 min-w-0">Published</div>
            <div className="w-12 shrink-0">By</div>
            <div className="w-4 shrink-0" />
          </div>

          {/* Version List */}
          <div className="space-y-0.5">
            {versions.map((version, index) => (
              <div
                key={index}
                className="group flex items-center gap-1.5 px-1.5 py-1.5 hover:bg-secondary/40 rounded-lg transition-colors"
              >
                <div className="w-14 shrink-0">
                  <span className="text-xs text-primary px-1.5 py-0.5 bg-primary/8 rounded" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {version.version}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-xs text-muted truncate">
                  {version.publishDate}
                </div>
                <div className="w-12 shrink-0 flex items-center">
                  <MemberAvatar
                    name={version.publishedBy}
                    initials={version.publishedByInitials}
                    color={version.publishedByColor}
                    size="sm"
                  />
                </div>
                <div className="w-5 shrink-0 relative" ref={activeMenu === index ? menuRef : null}>
                  <button
                    onClick={() => setActiveMenu(activeMenu === index ? null : index)}
                    className="md:opacity-0 md:group-hover:opacity-100 hover:bg-secondary p-1 rounded-md transition-all"
                    aria-label={`Version ${version.version} options`}
                    aria-haspopup="true"
                    aria-expanded={activeMenu === index}
                  >
                    <MoreHorizontal size={14} className="text-muted -rotate-90" aria-hidden="true" />
                  </button>

                  {/* Context Menu */}
                  {activeMenu === index && (
                    <div
                      className="absolute right-0 top-full mt-1 w-52 max-w-[calc(100vw-32px)] bg-card border border-border rounded-xl z-20 overflow-hidden p-1"
                      style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                    >
                      {canRollback && (
                        <button
                          onClick={() => handleRollback(index)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          <RotateCcw size={14} className="text-[#F59E0B]" />
                          <span>Rollback to this version</span>
                        </button>
                      )}
                      <button
                        onClick={() => handlePreview(index)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Eye size={14} className="text-primary" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleViewChanges(index)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <FileText size={14} className="text-muted" />
                        <span>View changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
