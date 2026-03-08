import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface ResizableColumnHeaderProps {
  label: string;
  width: number;
  onResize: (newWidth: number) => void;
  sortable?: boolean;
  sortKey?: string;
  currentSort?: { key: string, direction: 'asc' | 'desc' } | null;
  onSort?: () => void;
  sticky?: boolean;
  stickyLeft?: number;
  backgroundColor?: string;
}

export function ResizableColumnHeader({
  label,
  width,
  onResize,
  sortable = false,
  sortKey = '',
  currentSort = null,
  onSort,
  sticky = false,
  stickyLeft = 0,
  backgroundColor,
}: ResizableColumnHeaderProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(80, startWidthRef.current + diff);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize]);

  const isSorted = currentSort && currentSort.key === sortKey;
  const sortDirection = isSorted ? currentSort.direction : null;

  return (
    <th
      className={`text-left px-6 py-3 text-sm font-normal text-foreground relative group transition-colors ${sticky ? 'sticky z-10' : ''}`}
      style={{ 
        width: `${width}px`, 
        minWidth: `${width}px`, 
        maxWidth: `${width}px`,
        fontFamily: 'var(--font-family)',
        ...(sticky ? { 
          left: `${stickyLeft}px`,
        } : {}),
        ...(backgroundColor ? { backgroundColor } : {})
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor || 'transparent';
      }}
    >
      <div className="flex items-center gap-2">
        {sortable && onSort ? (
          <button
            onClick={onSort}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <span>{label}</span>
            {isSorted && sortDirection === 'asc' && <ChevronUp className="w-3 h-3" />}
            {isSorted && sortDirection === 'desc' && <ChevronDown className="w-3 h-3" />}
            {!isSorted && <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />}
          </button>
        ) : (
          <span>{label}</span>
        )}
      </div>
      
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary opacity-0 hover:opacity-100 transition-opacity"
        style={{ userSelect: 'none' }}
      />
    </th>
  );
}
