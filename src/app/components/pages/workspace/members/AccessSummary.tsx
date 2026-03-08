interface AccessSummaryProps {
  projectCount?: number;
  folderCount?: number;
  itemCount?: number;
}

export function AccessSummary({ projectCount = 0, folderCount = 0, itemCount = 0 }: AccessSummaryProps) {
  const parts: string[] = [];

  if (projectCount > 0) {
    parts.push(`${projectCount} project${projectCount !== 1 ? 's' : ''}`);
  }
  if (folderCount > 0) {
    parts.push(`${folderCount} folder${folderCount !== 1 ? 's' : ''}`);
  }
  if (itemCount > 0) {
    parts.push(`${itemCount} item${itemCount !== 1 ? 's' : ''}`);
  }

  const text = parts.length > 0 ? parts.join(', ') : 'No access';

  return (
    <span
      className="text-xs"
      style={{
        color: 'var(--muted)',
        fontFamily: 'var(--font-family)',
      }}
    >
      {text}
    </span>
  );
}
