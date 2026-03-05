import { useState, useRef } from 'react';
import { MediaFile } from './ProcedureEditor';
import svgPaths from '../../../imports-procedure-editor/svg-46ve5r1m42';
import { Upload, Trash2, AlertCircle } from 'lucide-react';

interface MediaViewerProps {
  mediaFiles: MediaFile[];
  onAddMediaFiles: (files: MediaFile[]) => void;
  onRemoveMediaFile: (id: string) => void;
  onReorderMedia?: (fromIndex: number, toIndex: number) => void;
  compact?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export function MediaViewer({ mediaFiles, onAddMediaFiles, onRemoveMediaFile, onReorderMedia, compact = false }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedMediaIndex, setDraggedMediaIndex] = useState<number | null>(null);
  const [dragOverMediaIndex, setDragOverMediaIndex] = useState<number | null>(null);
  
  const currentMedia = mediaFiles[currentIndex];
  
  // Safety check: if currentIndex is out of bounds, reset to 0
  if (mediaFiles.length > 0 && !currentMedia) {
    setCurrentIndex(0);
  }
  
  const isVideo = currentMedia?.type.startsWith('video/');

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
      setTimeout(() => setUploadError(null), 5000);
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

    // Only process file drops, not media reordering drops
    if (draggedMediaIndex === null && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragActive for file uploads, not for media reordering
    if (draggedMediaIndex === null) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Compact mode: just show a thumbnail row with upload button
  if (compact) {
    return (
      <>
        <div
          data-tutorial="media-viewer"
          className="flex items-center relative w-full"
          style={{ gap: '8px' }}
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
          {mediaFiles.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center transition-all hover:bg-gray-100"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '6px',
                border: '1px dashed #C2C9DB',
                background: '#F8FAFC',
                cursor: 'pointer',
                gap: '6px',
                color: '#868D9E',
                fontSize: '12px'
              }}
            >
              <Upload className="size-4" />
              <span>Add media</span>
            </button>
          ) : (
            <div className="flex gap-2 overflow-x-auto w-full scrollbar-hide" style={{ padding: '2px 0' }}>
              {mediaFiles.map((file, index) => (
                <div key={file.id} className="relative flex-shrink-0 group">
                  <button
                    onClick={() => { setCurrentIndex(index); setIsFullscreen(true); }}
                    className={`relative rounded overflow-hidden transition-all ${
                      index === currentIndex ? 'ring-2 ring-[#2F80ED]' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ width: '44px', height: '44px', border: '1px solid #E2E8F0' }}
                  >
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover pointer-events-none" />
                    ) : file.type.startsWith('video/') ? (
                      <>
                        <video src={file.url} className="w-full h-full object-cover pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 6 8.92679">
                            <path d={svgPaths.p6f86700} fill="white" />
                          </svg>
                        </div>
                      </>
                    ) : null}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMediaFile(file.id);
                      if (index === currentIndex && index > 0) setCurrentIndex(index - 1);
                      else if (index < currentIndex) setCurrentIndex(currentIndex - 1);
                    }}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    style={{ background: '#FF1F1F' }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="size-2.5 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 rounded overflow-hidden opacity-60 hover:opacity-100 transition-all flex items-center justify-center border border-dashed"
                style={{ width: '44px', height: '44px', borderColor: '#C2C9DB', background: '#F8FAFC' }}
                aria-label="Add more files"
              >
                <Upload className="size-3.5" style={{ color: '#868D9E' }} />
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && currentMedia && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
            onClick={handleCloseFullscreen}
          >
            <button
              onClick={handleCloseFullscreen}
              className="absolute top-4 right-4 text-white hover:opacity-70 transition-opacity"
              style={{ fontSize: '32px', width: '48px', height: '48px' }}
              aria-label="Close fullscreen"
            >×</button>
            <div className="relative w-full h-full flex items-center justify-center p-8">
              {currentMedia.type.startsWith('image/') ? (
                <img src={currentMedia.url} alt={currentMedia.name} className="max-w-full max-h-full object-contain" />
              ) : currentMedia.type.startsWith('video/') ? (
                <video src={currentMedia.url} controls autoPlay className="max-w-full max-h-full" />
              ) : null}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Media Holder - Always visible, matches Figma design */}
      <div
        data-tutorial="media-viewer"
        className="content-stretch flex flex-col items-start relative"
        style={{
          background: '#F8FAFC',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          gap: '8px'
        }}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Full Screen Media Container */}
        <div className="content-stretch flex items-start relative w-full">
          <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative w-full" style={{ gap: '10px' }}>
            {/* Media Display */}
            <div
              className="bg-black content-stretch flex flex-col items-start justify-center relative w-full cursor-pointer"
              style={{
                aspectRatio: '1408/826',
                gap: '10px',
                paddingTop: '40px',
                paddingBottom: '40px'
              }}
              onClick={() => {
                if (mediaFiles.length === 0) {
                  fileInputRef.current?.click();
                }
              }}
            >
              {/* Empty State or Media */}
              {mediaFiles.length === 0 ? (
                <div 
                  className={`flex-[1_0_0] min-h-px min-w-px relative w-full flex flex-col items-center justify-center transition-all ${
                    dragActive ? 'bg-accent/20' : ''
                  }`}
                >
                  <Upload 
                    className="size-12 mb-3" 
                    style={{ color: dragActive ? 'var(--accent)' : 'var(--muted-foreground)' }} 
                  />
                  <p 
                    className="text-sm text-center"
                    style={{ 
                      color: dragActive ? 'var(--accent)' : 'var(--muted-foreground)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    {dragActive ? 'Drop files here' : 'Drop files or click to upload'}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ 
                      color: 'var(--muted-foreground)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    Images and videos up to 50MB
                  </p>
                </div>
              ) : (
                <div className="flex-[1_0_0] min-h-px min-w-px overflow-clip relative w-full">
                  {currentMedia.type.startsWith('image/') ? (
                    <img 
                      alt={currentMedia.name}
                      className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                      src={currentMedia.url}
                    />
                  ) : currentMedia.type.startsWith('video/') ? (
                    <video 
                      className="absolute inset-0 max-w-none object-cover size-full"
                      src={currentMedia.url}
                      controls
                    />
                  ) : null}

                  {/* Play Icon Overlay for Videos (when not playing) */}
                  {isVideo && (
                    <div className="absolute inset-[30.76%_39.81%] pointer-events-none">
                      <div className="-translate-y-1/2 absolute aspect-[25.377485275268555/37.75656509399414] contents left-[33.33%] right-[29.17%] top-[calc(50%+0.17px)]">
                        <div className="-translate-y-1/2 absolute aspect-[8.300860404968262/12.350000381469727] left-[33.33%] right-[29.17%] top-[calc(50%+0.17px)]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.3775 37.7566">
                            <path d={svgPaths.pcf31800} fill="white" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fullscreen Button - Bottom Right Corner, Rotated 45deg - Only show when media exists */}
                  <button
                    onClick={handleFullscreen}
                    className="absolute bottom-[-0.23px] flex items-center justify-center right-0"
                    style={{
                      width: '33.941px',
                      height: '33.941px'
                    }}
                    aria-label="View fullscreen"
                  >
                    <div className="flex-none rotate-45">
                      <div className="overflow-clip relative" style={{ width: '24px', height: '24px' }}>
                        <div className="absolute right-0 top-0" style={{ width: '24px', height: '24px' }}>
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                            <path d={svgPaths.p14ca0800} fill="white" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div 
            className="flex items-start gap-2 w-full p-2 border"
            style={{
              background: 'var(--destructive-bg, rgba(239, 68, 68, 0.1))',
              borderColor: 'var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <AlertCircle 
              className="size-3 flex-shrink-0 mt-0.5" 
              style={{ color: 'var(--destructive, #ef4444)' }} 
            />
            <p 
              className="text-xs" 
              style={{ 
                color: 'var(--destructive, #ef4444)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              {uploadError}
            </p>
          </div>
        )}

        {/* Thumbnail Navigation - Show when there are media files */}
        {mediaFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto w-full scrollbar-hide" style={{ padding: '4px 0' }}>
            {mediaFiles.map((file, index) => (
              <div
                key={file.id}
                className="relative flex-shrink-0 group"
              >
                {/* Drop indicator line - show when dragging over this position */}
                {onReorderMedia && draggedMediaIndex !== null && dragOverMediaIndex === index && draggedMediaIndex !== index && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full z-10"
                    style={{ marginLeft: '-6px' }}
                  />
                )}
                
                <button
                  draggable={!!onReorderMedia}
                  onDragStart={(e) => {
                    if (onReorderMedia) {
                      setDraggedMediaIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', index.toString());
                    }
                  }}
                  onDragEnd={() => {
                    setDraggedMediaIndex(null);
                    setDragOverMediaIndex(null);
                  }}
                  onDragOver={(e) => {
                    if (onReorderMedia && draggedMediaIndex !== null) {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverMediaIndex(index);
                    }
                  }}
                  onDrop={(e) => {
                    if (onReorderMedia && draggedMediaIndex !== null && draggedMediaIndex !== index) {
                      e.preventDefault();
                      e.stopPropagation();
                      onReorderMedia(draggedMediaIndex, index);
                      setDraggedMediaIndex(null);
                      setDragOverMediaIndex(null);
                    }
                  }}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative rounded overflow-hidden transition-all ${
                    index === currentIndex 
                      ? 'ring-2 scale-105' 
                      : 'opacity-60 hover:opacity-100'
                  } ${draggedMediaIndex === index ? 'opacity-50' : ''} ${onReorderMedia ? 'cursor-move' : ''}`}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: '1px solid #36415d',
                    ringColor: 'var(--accent)'
                  }}
                >
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : file.type.startsWith('video/') ? (
                    <>
                      <video 
                        src={file.url}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 6 8.92679">
                          <path d={svgPaths.p6f86700} fill="white" />
                        </svg>
                      </div>
                    </>
                  ) : null}
                </button>
                
                {/* Drop indicator line - show at the end when dragging over last position */}
                {onReorderMedia && draggedMediaIndex !== null && dragOverMediaIndex === index && index === mediaFiles.length - 1 && draggedMediaIndex !== index && (
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1 bg-accent rounded-full z-10"
                    style={{ marginRight: '-6px' }}
                  />
                )}
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMediaFile(file.id);
                    // Adjust current index if needed
                    if (index === currentIndex && index > 0) {
                      setCurrentIndex(index - 1);
                    } else if (index < currentIndex) {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }}
                  className="absolute -top-1 -right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  style={{
                    background: 'var(--destructive, #ef4444)'
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="size-3 text-white" />
                </button>
              </div>
            ))}
            
            {/* Add More Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative flex-shrink-0 rounded overflow-hidden opacity-60 hover:opacity-100 transition-all flex items-center justify-center border-2 border-dashed"
              style={{
                width: '60px',
                height: '60px',
                borderColor: 'var(--border)',
                background: 'rgba(0, 0, 0, 0.3)'
              }}
              aria-label="Add more files"
            >
              <Upload className="size-5" style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && currentMedia && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
          onClick={handleCloseFullscreen}
        >
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 text-white hover:opacity-70 transition-opacity"
            style={{
              fontSize: '32px',
              width: '48px',
              height: '48px'
            }}
            aria-label="Close fullscreen"
          >
            ×
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {currentMedia.type.startsWith('image/') ? (
              <img 
                src={currentMedia.url} 
                alt={currentMedia.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : currentMedia.type.startsWith('video/') ? (
              <video 
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            ) : null}
          </div>

          {/* Thumbnails in fullscreen */}
          {mediaFiles.length > 1 && (
            <div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-[90vw] p-4 scrollbar-hide"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {mediaFiles.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 rounded overflow-hidden transition-all ${
                    index === currentIndex 
                      ? 'ring-2 scale-105' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    ringColor: 'var(--accent)'
                  }}
                >
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : file.type.startsWith('video/') ? (
                    <>
                      <video 
                        src={file.url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 6 8.92679">
                          <path d={svgPaths.p6f86700} fill="white" />
                        </svg>
                      </div>
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
