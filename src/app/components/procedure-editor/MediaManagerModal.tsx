import { MediaFile } from './ProcedureEditor';
import { X, Upload, GripVertical, Type, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'motion/react';

interface MediaManagerModalProps {
  mediaFiles: MediaFile[];
  onUpdateMediaFiles: (mediaFiles: MediaFile[]) => void;
  onClose: () => void;
  maxFiles?: number;
}

interface DraggableMediaItemProps {
  media: MediaFile;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}

const MAX_CAPTION_LENGTH = 200;

function DraggableMediaItem({
  media,
  index,
  onMove,
  onRemove,
  onUpdateCaption
}: DraggableMediaItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [localCaption, setLocalCaption] = useState(media.caption || '');

  const [{ isDragging }, drag] = useDrag({
    type: 'MEDIA',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'MEDIA',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const handleSaveCaption = () => {
    onUpdateCaption(media.id, localCaption);
    setIsEditingCaption(false);
  };

  const handleCancelCaption = () => {
    setLocalCaption(media.caption || '');
    setIsEditingCaption(false);
  };

  return (
    <motion.div
      ref={ref}
      layout
      className="relative rounded-lg overflow-hidden border transition-all"
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: 'var(--card)',
        borderColor: isOver ? 'var(--primary)' : 'var(--border)',
        borderWidth: isOver ? '2px' : '1px'
      }}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-2 left-2 z-10 p-1.5 rounded cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white'
        }}
      >
        <GripVertical className="size-4" />
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(media.id)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded transition-all hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
        style={{
          backgroundColor: 'var(--destructive)',
          color: 'var(--destructive-foreground)'
        }}
        aria-label="Remove media"
      >
        <Trash2 className="size-4" />
      </button>

      {/* Media Preview */}
      <div
        className="aspect-video relative"
        style={{ backgroundColor: 'var(--secondary)' }}
      >
        {media.type.startsWith('image/') ? (
          <>
            <img
              src={media.url}
              alt={media.name}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-2 left-2 flex items-center rounded px-2 py-1"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-xs)',
                gap: 'var(--spacing-xs)'
              }}
            >
              <ImageIcon className="size-3" />
              Image
            </div>
          </>
        ) : (
          <>
            <video
              src={media.url}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-2 left-2 flex items-center rounded px-2 py-1"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-xs)',
                gap: 'var(--spacing-xs)'
              }}
            >
              <Video className="size-3" />
              Video
            </div>
          </>
        )}
      </div>

      {/* Caption Section */}
      <div style={{ padding: 'var(--spacing-md)' }}>
        {isEditingCaption ? (
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
            <textarea
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSaveCaption();
                } else if (e.key === 'Escape') {
                  handleCancelCaption();
                }
              }}
              placeholder="Add a caption..."
              maxLength={MAX_CAPTION_LENGTH}
              rows={2}
              className="w-full px-2 py-1.5 rounded outline-none resize-none border-2"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--ring)'
              }}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {localCaption.length}/{MAX_CAPTION_LENGTH}
              </span>
              <div className="flex" style={{ gap: 'var(--spacing-xs)' }}>
                <button
                  onClick={handleCancelCaption}
                  className="px-2 py-1 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    fontFamily: 'var(--font-family)',
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--foreground)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCaption}
                  className="px-2 py-1 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingCaption(true)}
            className="w-full text-left p-2 rounded transition-colors hover:bg-secondary/50"
          >
            {media.caption ? (
              <p
                className="line-clamp-2"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)'
                }}
              >
                {media.caption}
              </p>
            ) : (
              <div
                className="flex items-center opacity-50"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                  gap: 'var(--spacing-xs)'
                }}
              >
                <Type className="size-3.5" />
                Add caption...
              </div>
            )}
          </button>
        )}
      </div>

      {/* File Name */}
      <div
        className="px-3 pb-2 truncate"
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted-foreground)'
        }}
        title={media.name}
      >
        {media.name}
      </div>
    </motion.div>
  );
}

export function MediaManagerModal({
  mediaFiles,
  onUpdateMediaFiles,
  onClose,
  maxFiles = 5
}: MediaManagerModalProps) {
  const [localMediaFiles, setLocalMediaFiles] = useState<MediaFile[]>(mediaFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMove = (fromIndex: number, toIndex: number) => {
    const newMediaFiles = [...localMediaFiles];
    const [movedItem] = newMediaFiles.splice(fromIndex, 1);
    newMediaFiles.splice(toIndex, 0, movedItem);
    setLocalMediaFiles(newMediaFiles);
  };

  const handleRemove = (id: string) => {
    const newMediaFiles = localMediaFiles.filter(m => m.id !== id);
    setLocalMediaFiles(newMediaFiles);
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    const newMediaFiles = localMediaFiles.map(m =>
      m.id === id ? { ...m, caption } : m
    );
    setLocalMediaFiles(newMediaFiles);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (localMediaFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} media files per popup`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newMediaFiles: MediaFile[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        url,
        name: file.name,
        type: file.type,
        size: file.size,
        caption: ''
      };
      newMediaFiles.push(mediaFile);
    });

    setLocalMediaFiles([...localMediaFiles, ...newMediaFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onUpdateMediaFiles(localMediaFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative rounded-lg w-full max-w-5xl max-w-[calc(100vw-32px)] max-h-[90vh] flex flex-col overflow-hidden border"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-lg)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b"
          style={{
            padding: 'var(--spacing-lg)',
            borderColor: 'var(--border)'
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-h3)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--foreground)'
              }}
            >
              Media Manager
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                marginTop: 'var(--spacing-xs)'
              }}
            >
              Drag to reorder • {localMediaFiles.length}/{maxFiles} files
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--foreground)' }}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center border-b"
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                borderColor: 'var(--border)',
                gap: 'var(--spacing-sm)'
              }}
            >
              <X className="size-4" />
              <span
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--spacing-lg)' }}
        >
          {localMediaFiles.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center"
              style={{
                padding: 'var(--spacing-2xl)',
                gap: 'var(--spacing-md)'
              }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                <ImageIcon className="size-10" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)'
                  }}
                >
                  No media files yet
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                    marginTop: 'var(--spacing-xs)'
                  }}
                >
                  Upload images or videos to get started
                </p>
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{ gap: 'var(--spacing-md)' }}
            >
              {localMediaFiles.map((media, index) => (
                <DraggableMediaItem
                  key={media.id}
                  media={media}
                  index={index}
                  onMove={handleMove}
                  onRemove={handleRemove}
                  onUpdateCaption={handleUpdateCaption}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t gap-3 sm:gap-4"
          style={{
            padding: 'var(--spacing-lg)',
            borderColor: 'var(--border)'
          }}
        >
          <label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={localMediaFiles.length >= maxFiles}
            />
            <span
              className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                gap: 'var(--spacing-sm)',
                opacity: localMediaFiles.length >= maxFiles ? 0.5 : 1,
                pointerEvents: localMediaFiles.length >= maxFiles ? 'none' : 'auto'
              }}
            >
              <Upload className="size-4" />
              Upload Media
            </span>
          </label>

          <div className="flex justify-end" style={{ gap: 'var(--spacing-sm)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 min-h-[44px] rounded-lg transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--secondary)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 min-h-[44px] rounded-lg transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
