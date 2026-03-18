import { useRef, useState } from 'react';
import { Upload, Trash2, Camera } from 'lucide-react';
import { useAvatar } from '../contexts/AvatarContext';
import { useAppPopup } from '../contexts/AppPopupContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface UserAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showOnlineStatus?: boolean;
  editable?: boolean;
  initials?: string;
}

export function UserAvatar({ 
  size = 'medium', 
  showOnlineStatus = false, 
  editable = false,
  initials = 'YD'
}: UserAvatarProps) {
  const { avatarUrl, uploadAvatar, removeAvatar } = useAvatar();
  const { alert: appAlert } = useAppPopup();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'size-9',
    medium: 'size-10',
    large: 'size-16',
  };

  const fontSizes = {
    small: 'var(--text-sm)',
    medium: 'var(--text-sm)',
    large: 'var(--text-xl)',
  };

  const statusSizes = {
    small: 'w-2.5 h-2.5',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  // Close context menu when clicking outside
  useClickOutside([contextMenuRef, avatarRef], () => setShowContextMenu(false), showContextMenu);

  const handleAvatarClick = (e: React.MouseEvent) => {
    if (!editable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = avatarRef.current?.getBoundingClientRect();
    if (rect) {
      // Check if there's enough space below, otherwise show above
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 100; // Approximate menu height
      
      let x = rect.left;
      let y = rect.bottom + 4;
      
      // If not enough space below and more space above, show above
      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        y = rect.top - menuHeight - 4;
      }
      
      setContextMenuPosition({ x, y });
      setShowContextMenu(!showContextMenu);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setShowContextMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        await appAlert('Please select an image file.', { title: 'Invalid File', variant: 'error' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        await appAlert('Image size should be less than 5MB.', { title: 'File Too Large', variant: 'error' });
        return;
      }

      await uploadAvatar(file);
    }
  };

  const handleRemoveAvatar = () => {
    removeAvatar();
    setShowContextMenu(false);
  };

  return (
    <>
      <div className="relative" ref={avatarRef}>
        <div
          onClick={handleAvatarClick}
          className={`${sizeClasses[size]} flex items-center justify-center text-white flex-shrink-0 rounded-full overflow-hidden relative ${
            editable ? 'cursor-pointer group' : ''
          }`}
          style={{
            fontSize: fontSizes[size],
            fontWeight: 'var(--font-weight-bold)',
            background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--color-primary), #004FFF)'
          }}
        >
          {editable && (
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none rounded-full flex items-center justify-center">
              <Camera 
                size={size === 'large' ? 24 : size === 'medium' ? 16 : 14} 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'white' }}
              />
            </div>
          )}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        
        {showOnlineStatus && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-2`}
            style={{ backgroundColor: '#11E874', borderColor: 'var(--color-background)', boxShadow: '0 0 6px rgba(17,232,116,0.4)' }}
          />
        )}
      </div>

      {/* Context Menu */}
      {editable && showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-card border border-border rounded-xl py-1 z-[100]"
          style={{
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: '176px',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <div className="p-1">
            <button
              onClick={handleUploadClick}
              className="w-full px-3 py-2.5 min-h-[44px] text-left hover:bg-secondary rounded-lg transition-colors flex items-center gap-2.5"
            >
              <Upload size={15} className="text-foreground" />
              <span className="text-sm text-foreground">
                Upload Avatar
              </span>
            </button>

            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="w-full px-3 py-2.5 min-h-[44px] text-left hover:bg-destructive/8 rounded-lg transition-colors flex items-center gap-2.5"
              >
                <Trash2 size={15} className="text-destructive" />
                <span className="text-sm text-destructive">
                  Remove Avatar
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
