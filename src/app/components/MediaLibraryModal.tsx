import { X, Paperclip } from 'lucide-react';

interface MediaLibraryModalProps {
  onClose: () => void;
  onSelect: (files: string[]) => void;
  isMobile: boolean;
}

export function MediaLibraryModal({ onClose, onSelect, isMobile }: MediaLibraryModalProps) {
  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 ${
        isMobile ? '' : 'flex items-center justify-center p-[16px]'
      }`}
      onClick={onClose}
    >
      <div
        className={`${
          isMobile
            ? 'absolute bottom-0 left-0 right-0 rounded-t-[16px] max-h-[85vh]'
            : 'relative w-full max-w-[800px] max-h-[80vh] rounded-lg'
        } bg-card border border-border flex flex-col shadow-elevation-md`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isMobile ? 'slideUp 0.3s ease-out' : undefined,
        }}
      >
        {/* Mobile sheet handle */}
        {isMobile && (
          <div className="flex justify-center pt-[12px] pb-[8px]">
            <div
              className="w-[40px] h-[4px] rounded-full"
              style={{ backgroundColor: 'var(--muted)' }}
            />
          </div>
        )}

        {/* Header */}
        <div
          className="flex items-center justify-between px-[20px] py-[16px] border-b border-border shrink-0"
        >
          <h3
            style={{
              fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--foreground)',
            }}
          >
            Select from Library
          </h3>
          <button
            onClick={onClose}
            className="p-[6px] hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} style={{ color: 'var(--foreground)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-[20px]">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-[12px]`}>
            {/* Mock library files */}
            {[
              'Assembly_Manual.pdf',
              'Safety_Guidelines.pdf',
              'Product_Photo_1.jpg',
              'Product_Photo_2.jpg',
              'Diagram_v2.png',
              'Specs_Sheet.xlsx',
            ].map((file, idx) => (
              <button
                key={idx}
                className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-colors p-[16px] flex flex-col items-center justify-center gap-[8px] bg-secondary/30"
                onClick={() => onSelect([file])}
              >
                <Paperclip size={isMobile ? 28 : 32} style={{ color: 'var(--muted)' }} />
                <span
                  className="text-center truncate w-full"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                  }}
                >
                  {file}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-[20px] ${isMobile ? 'py-[20px] pb-[32px]' : 'py-[16px]'} border-t border-border shrink-0`}>
          <button
            onClick={onClose}
            className="w-full px-[16px] py-[12px] rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--foreground)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
