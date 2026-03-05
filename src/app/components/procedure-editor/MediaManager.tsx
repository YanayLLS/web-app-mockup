import { X, Upload, Trash2, Image as ImageIcon, Video, File, AlertCircle, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';
import { MediaFile } from './ProcedureEditor';
import { useDrag, useDrop } from 'react-dnd';

interface MediaManagerProps {
  mediaFiles: MediaFile[];
  onAddMediaFiles: (files: MediaFile[]) => void;
  onRemoveMediaFile: (id: string) => void;
  onReorderMedia: (fromIndex: number, toIndex: number) => void;
  onClose: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

interface DraggableMediaItemProps {
  file: MediaFile;
  index: number;
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

const DraggableMediaItem = ({ file, index, onRemove, onMove }: DraggableMediaItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'MEDIA',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'MEDIA',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors group"
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        background: isOver ? 'var(--accent)/10' : undefined
      }}
    >
      {/* Drag Handle */}
      <div 
        ref={drag}
        className="cursor-grab active:cursor-grabbing p-1"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <GripVertical className="size-4" />
      </div>

      {/* Preview/Icon */}
      <div className="w-16 h-16 rounded bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
        {ALLOWED_IMAGE_TYPES.includes(file.type) ? (
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : ALLOWED_VIDEO_TYPES.includes(file.type) ? (
          <Video className="size-8 text-accent" />
        ) : (
          <File className="size-8 text-muted" />
        )}
        <ImageIcon className="size-8 text-muted hidden" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--foreground)' }}>
          {file.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {(file.size / 1024 / 1024).toFixed(2)} MB
          {index === 0 && (
            <span className="ml-2" style={{ color: 'var(--accent)' }}>• Thumbnail</span>
          )}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(file.id)}
        className="p-2 rounded hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete media"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};

function MediaManagerContent({ mediaFiles, onAddMediaFiles, onRemoveMediaFile, onReorderMedia, onClose }: MediaManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large (max 50MB)`;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Only images and videos allowed.`;
    }

    return null;
  };

  const processFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    setIsUploading(true);

    const fileArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: MediaFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        continue;
      }

      try {
        const url = URL.createObjectURL(file);
        const mediaFile: MediaFile = {
          id: crypto.randomUUID(),
          url,
          name: file.name,
          type: file.type,
          size: file.size
        };
        validFiles.push(mediaFile);
      } catch (err) {
        errors.push(`${file.name}: Failed to process file`);
      }
    }

    setIsUploading(false);

    if (errors.length > 0) {
      setUploadError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onAddMediaFiles(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (ALLOWED_IMAGE_TYPES.includes(type)) return <ImageIcon className="size-5 text-primary" />;
    if (ALLOWED_VIDEO_TYPES.includes(type)) return <Video className="size-5 text-primary" />;
    return <File className="size-5 text-muted" />;
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-manager-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-card rounded-lg w-full max-w-[600px] shadow-elevation-sm max-h-[90vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 id="media-manager-title" className="text-card-foreground">Media Manager</h3>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Close media manager"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-border">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileInput}
            className="hidden"
            aria-label="Upload media files"
          />
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary hover:bg-secondary/30'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Drop files here or click to upload"
          >
            <Upload className={`size-12 mx-auto mb-3 ${dragActive ? 'text-primary' : 'text-muted'}`} />
            <p className="text-card-foreground font-bold mb-1">
              {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-muted text-sm">
              Images and videos up to 50MB
            </p>
          </div>

          {uploadError && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
              <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-destructive font-bold text-sm mb-1">Upload Error</p>
                <p className="text-destructive text-xs whitespace-pre-line">{uploadError}</p>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="text-destructive hover:text-destructive/80"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Media List */}
        <div className="flex-1 overflow-y-auto p-4">
          {mediaFiles.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="size-16 mx-auto mb-3 text-muted" />
              <p className="text-muted">No media files yet</p>
              <p className="text-muted text-sm mt-1">Upload images or videos to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mediaFiles.map((file, index) => (
                <DraggableMediaItem
                  key={file.id}
                  file={file}
                  index={index}
                  onRemove={onRemoveMediaFile}
                  onMove={onReorderMedia}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-muted text-sm">
            {mediaFiles.length} / 10 files
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaManager(props: MediaManagerProps) {
  return <MediaManagerContent {...props} />;
}
