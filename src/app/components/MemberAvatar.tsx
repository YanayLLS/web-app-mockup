import { type MouseEvent, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUserProfile, getAvatarInitials, getAvatarColor, type ProfileUser } from '../contexts/UserProfileContext';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface MemberAvatarProps {
  /** User name (required for initials + color generation) */
  name: string;
  /** User ID for consistent color hashing */
  id?: string;
  /** Override auto-generated initials */
  initials?: string;
  /** Override auto-generated background color */
  color?: string;
  /** Profile image URL */
  imageUrl?: string;
  /** Avatar size: xs=20px, sm=24px, md=28px, lg=32px, xl=36px, 2xl=40px */
  size?: AvatarSize;
  /** Show tooltip on hover (default: true) */
  showTooltip?: boolean;
  /** Custom tooltip text (defaults to name) */
  tooltipText?: string;
  /** Called when remove X button is clicked */
  onRemove?: (e: MouseEvent) => void;
  /** Custom click handler (overrides profile open) */
  onClick?: (e: MouseEvent) => void;
  /** Show profile side modal on click (default: true unless onClick provided) */
  showProfileOnClick?: boolean;
  /** Extra user info for the profile modal */
  email?: string;
  role?: string;
  status?: 'active' | 'invited' | 'offline';
  phone?: string;
  location?: string;
  lastActive?: string;
  groups?: string[];
  /** Show border (for stacked/overlapping avatars) */
  border?: boolean;
  /** Additional CSS classes on the outermost wrapper */
  className?: string;
  /** Show online status dot */
  showStatus?: boolean;
}

const sizeConfig: Record<AvatarSize, { px: string; text: string; removeBtnSize: string; statusSize: string }> = {
  xs:  { px: 'w-5 h-5',  text: 'text-[9px]',  removeBtnSize: 'w-3.5 h-3.5 text-[8px]',  statusSize: 'w-1.5 h-1.5' },
  sm:  { px: 'w-6 h-6',  text: 'text-[10px]', removeBtnSize: 'w-4 h-4 text-[9px]',    statusSize: 'w-2 h-2' },
  md:  { px: 'w-7 h-7',  text: 'text-xs',     removeBtnSize: 'w-4 h-4 text-[9px]',    statusSize: 'w-2 h-2' },
  lg:  { px: 'w-8 h-8',  text: 'text-xs',     removeBtnSize: 'w-4.5 h-4.5 text-[10px]', statusSize: 'w-2.5 h-2.5' },
  xl:  { px: 'w-9 h-9',  text: 'text-sm',     removeBtnSize: 'w-5 h-5 text-xs',       statusSize: 'w-2.5 h-2.5' },
  '2xl': { px: 'w-10 h-10', text: 'text-sm',    removeBtnSize: 'w-5 h-5 text-xs',       statusSize: 'w-3 h-3' },
};

const statusColors: Record<string, string> = {
  active: '#11E874',
  invited: '#f59e0b',
  offline: '#7F7F7F',
};

export function MemberAvatar({
  name,
  id,
  initials: initOverride,
  color: colorOverride,
  imageUrl,
  size = 'lg',
  showTooltip = true,
  tooltipText,
  onRemove,
  onClick,
  showProfileOnClick = true,
  email,
  role,
  status,
  phone,
  location,
  lastActive,
  groups,
  border = false,
  className = '',
  showStatus = false,
}: MemberAvatarProps) {
  const { openProfile } = useUserProfile();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initials = initOverride || getAvatarInitials(name);
  const color = colorOverride || getAvatarColor(id || name);
  const cfg = sizeConfig[size];

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (showTooltip && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const above = rect.top > 60; // enough space above
      setTooltipPos({
        top: above ? rect.top - 4 : rect.bottom + 4,
        left: rect.left + rect.width / 2,
        above,
      });
    }
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTooltipPos(null);
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (showProfileOnClick) {
      e.stopPropagation();
      const profileData: ProfileUser = {
        id,
        name,
        email,
        role,
        status,
        imageUrl,
        initials,
        color,
        phone,
        location,
        lastActive,
        groups,
      };
      openProfile(profileData);
    }
  }, [onClick, showProfileOnClick, openProfile, id, name, email, role, status, imageUrl, initials, color, phone, location, lastActive, groups]);

  const handleRemove = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove?.(e);
  }, [onRemove]);

  const isClickable = !!onClick || showProfileOnClick;

  const tooltipContent = showTooltip && isHovered && tooltipPos ? (
    <div
      className="fixed px-2 py-1 rounded whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: tooltipPos.above ? undefined : `${tooltipPos.top}px`,
        bottom: tooltipPos.above ? `${window.innerHeight - tooltipPos.top}px` : undefined,
        left: `${tooltipPos.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backgroundColor: 'var(--color-popover, #1a1a2e)',
        color: 'var(--color-popover-foreground, #fff)',
        fontSize: 'var(--text-xs)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {tooltipText || name}
      {role && (
        <div style={{ fontSize: '10px', opacity: 0.7 }}>{role}</div>
      )}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={wrapperRef}
        className={`relative inline-flex group/avatar ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Avatar circle */}
        <div
          onClick={handleClick}
          className={`
            ${cfg.px} ${cfg.text} rounded-full flex items-center justify-center text-white shrink-0 select-none
            ${border ? 'border-2' : ''}
            ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-primary/30 hover:brightness-110 active:scale-95' : ''}
            transition-all duration-150
          `}
          style={{
            backgroundColor: imageUrl ? 'transparent' : color,
            borderColor: border ? 'var(--color-card, #fff)' : undefined,
            fontWeight: 'var(--font-weight-bold)',
          }}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          aria-label={isClickable ? `View profile: ${name}` : name}
          onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as any); } } : undefined}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Online status dot */}
        {showStatus && status && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 ${cfg.statusSize} rounded-full border-2`}
            style={{
              backgroundColor: statusColors[status] || statusColors.offline,
              borderColor: 'var(--color-card, #fff)',
            }}
          />
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={handleRemove}
            className={`
              absolute -top-1 -right-1 ${cfg.removeBtnSize} rounded-full
              flex items-center justify-center
              md:opacity-0 md:group-hover/avatar:opacity-100
              transition-all duration-150 shadow-sm
              hover:scale-110 active:scale-95
            `}
            style={{
              backgroundColor: 'var(--color-destructive, #FF1F1F)',
              color: 'white',
              }}
            title={`Remove ${name}`}
            aria-label={`Remove ${name}`}
          >
            ×
          </button>
        )}
      </div>

      {/* Tooltip rendered via portal to escape overflow containers */}
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Re-export utilities for convenience
export { getAvatarInitials, getAvatarColor } from '../contexts/UserProfileContext';
