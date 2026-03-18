import { FolderOpen, FileText, Layers } from 'lucide-react';

interface AccessSummaryProps {
  projectCount?: number;
  folderCount?: number;
  itemCount?: number;
}

export function AccessSummary({ projectCount, folderCount, itemCount }: AccessSummaryProps) {
  const hasAccess = (projectCount && projectCount > 0) || (folderCount && folderCount > 0) || (itemCount && itemCount > 0);

  if (!hasAccess) {
    return <span className="text-xs text-muted italic">No access</span>;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {projectCount && projectCount > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-primary/8 text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          <Layers size={10} />
          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
        </span>
      ) : null}
      {folderCount && folderCount > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#F59E0B]/8 text-[#F59E0B]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          <FolderOpen size={10} />
          {folderCount} {folderCount === 1 ? 'folder' : 'folders'}
        </span>
      ) : null}
      {itemCount && itemCount > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#8B5CF6]/8 text-[#8B5CF6]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          <FileText size={10} />
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      ) : null}
    </div>
  );
}
