import { X, Upload, Trash2, Image as ImageIcon, Video, File, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { MediaFile } from './ProcedureEditor';
import { motion, AnimatePresence } from 'motion/react';

interface MediaPanelProps {
  mediaFiles: MediaFile[];
  onAddMediaFiles: (files: MediaFile[]) => void;
  onRemoveMediaFile: (id: string) => void;
  onReorderMedia: (fromIndex: number, toIndex: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export function MediaPanel({ mediaFiles, onAddMediaFiles, onRemoveMediaFile, onReorderMedia, onClose, isOpen }: MediaPanelProps) {
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

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      onAddMediaFiles(validFiles);
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMediaIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[min(500px,calc(100vw-32px))] max-h-[80vh] flex flex-col mx-4"
            style={{
              background: 'var(--background)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-elevation-lg)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between shrink-0"
              style={{
                padding: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <h4 
                className="font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Media Files
              </h4>
              <button
                onClick={onClose}
                className="hover:bg-secondary/50 rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Close media panel"
              >
                <X className="size-5" style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>

            {/* Upload Area */}
            <div 
              className="shrink-0"
              style={{
                padding: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                className={`relative border-2 border-dashed p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-accent bg-accent/10'
                    : 'hover:border-accent/50'
                }`}
                style={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: dragActive ? 'var(--accent)' : 'var(--border)'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                <Upload className="size-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                  Drop files here or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="hover:underline min-h-[44px]"
                    style={{ color: 'var(--accent)' }}
                    disabled={isUploading}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Images and videos up to 50MB
                </p>
              </div>

              {uploadError && (
                <div 
                  className="flex items-start gap-2 mt-3 p-3 border"
                  style={{
                    background: 'var(--destructive-bg, rgba(239, 68, 68, 0.1))',
                    borderColor: 'var(--destructive, #ef4444)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <AlertCircle 
                    className="size-4 flex-shrink-0 mt-0.5" 
                    style={{ color: 'var(--destructive, #ef4444)' }} 
                  />
                  <p className="text-xs" style={{ color: 'var(--destructive, #ef4444)' }}>
                    {uploadError}
                  </p>
                </div>
              )}
            </div>

            {/* Media List */}
            <div 
              className="flex-1 overflow-y-auto"
              style={{ padding: 'var(--spacing-lg)' }}
            >
              {mediaFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ImageIcon 
                    className="size-12 mb-3 opacity-50" 
                    style={{ color: 'var(--muted-foreground)' }} 
                  />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    No media files yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    Upload images or videos to get started
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="flex gap-3 overflow-x-auto max-w-full scrollbar-hide pb-2" style={{ padding: '4px 0' }}>
                    {mediaFiles.map((file) => {
                      const Icon = getMediaIcon(file.type);
                      return (
                        <div
                          key={file.id}
                          className="group relative bg-secondary/30 rounded-lg overflow-hidden hover:border-accent transition-colors flex-shrink-0"
                          style={{ 
                            border: '1px solid var(--border)',
                            width: '140px'
                          }}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : file.type.startsWith('video/') ? (
                              <video
                                src={file.url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon className="size-8" style={{ color: 'var(--muted-foreground)' }} />
                            )}
                          </div>

                          {/* File Info */}
                          <div className="p-2">
                            <p 
                              className="text-xs truncate font-medium"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {file.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => onRemoveMediaFile(file.id)}
                            className="absolute top-1 right-1 p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                            style={{
                              background: 'var(--destructive, #ef4444)'
                            }}
                            aria-label={`Remove ${file.name}`}
                          >
                            <Trash2 className="size-3 text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="bg-secondary/30 shrink-0"
              style={{
                borderTop: '1px solid var(--border)',
                padding: 'var(--spacing-lg)'
              }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted-foreground)' }}>Total Files</span>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {mediaFiles.length}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
