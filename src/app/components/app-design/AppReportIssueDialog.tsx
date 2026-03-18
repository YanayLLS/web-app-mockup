import { useState, useRef } from 'react';
import { X, Upload, FileImage, ExternalLink } from 'lucide-react';

interface AppReportIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppReportIssueDialog({ isOpen, onClose }: AppReportIssueDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Mock save action
    onClose();
    setTitle('');
    setDescription('');
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-lg shadow-elevation-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
            Report an Issue
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Title
            </label>
            <input
              type="text"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-border outline-none text-foreground placeholder:text-muted focus:border-primary transition-colors"
            />
          </div>

          {/* Description textarea */}
          <div>
            <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Description
            </label>
            <textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border outline-none text-foreground placeholder:text-muted focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Media attachment area */}
          <div>
            <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Attachments
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}`}
            >
              <Upload className="size-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">
                Drag and drop files here, or{' '}
                <span className="text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>browse</span>
              </p>
              <p className="text-xs text-muted/60 mt-1">
                Images, videos, or documents
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                    <FileImage className="size-4 text-muted shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted shrink-0">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeAttachment(i); }}
                      className="p-0.5 text-muted hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 pt-0 space-y-3">
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full h-11 rounded-[25px] bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Save report
          </button>

          <div className="text-center">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
            >
              <span>Need help with our app? Visit quick response</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
