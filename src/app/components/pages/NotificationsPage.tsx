import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, CheckCircle2, Users, Calendar, Check, FolderOpen, FileText, Send, Headphones, Shield, AtSign, Monitor, Sparkles, MoreHorizontal, ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useNotifications, type NotificationType, type WebNotification } from '../../contexts/NotificationContext';

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  comment: { icon: MessageSquare, color: '#2F80ED', bg: 'rgba(47,128,237,0.1)' },
  milestone: { icon: CheckCircle2, color: '#11E874', bg: 'rgba(17,232,116,0.1)' },
  team: { icon: Users, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  meeting: { icon: Calendar, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  project: { icon: FolderOpen, color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  procedure: { icon: FileText, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  publish: { icon: Send, color: '#11E874', bg: 'rgba(17,232,116,0.1)' },
  'remote-support': { icon: Headphones, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  role: { icon: Shield, color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
  mention: { icon: AtSign, color: '#2F80ED', bg: 'rgba(47,128,237,0.1)' },
  system: { icon: Monitor, color: '#7F7F7F', bg: 'rgba(127,127,127,0.1)' },
  ai: { icon: Sparkles, color: '#004FFF', bg: 'rgba(0,79,255,0.1)' },
};

function NotificationsSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="mb-5">
        <div className="h-5 bg-muted/20 rounded-lg w-48 mb-2 animate-pulse" />
        <div className="h-3 bg-muted/15 rounded-lg w-64 animate-pulse" style={{ animationDelay: '75ms' }} />
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-border/60 bg-card animate-pulse"
            style={{ animationDelay: `${150 + i * 100}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted/15 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/20 rounded-lg" style={{ width: `${75 - i * 8}%` }} />
                <div className="h-3 bg-muted/15 rounded-lg w-1/4" />
              </div>
              <div className="w-16 h-3 bg-muted/10 rounded-lg shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl mb-5" style={{ boxShadow: '0 8px 32px rgba(47,128,237,0.06)' }}>
        <Bell size={32} className="text-primary/40" />
      </div>
      <h3 className="text-[15px] text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        No notifications yet
      </h3>
      <p className="text-xs text-muted text-center max-w-[260px] leading-relaxed">
        When there's new activity on your projects, you'll see it here
      </p>
    </div>
  );
}

function NotificationContextMenu({
  notification,
  position,
  onClose,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onNavigate,
}: {
  notification: WebNotification;
  position: { x: number; y: number };
  onClose: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Adjust position to stay on screen
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menuRef.current.style.left = `${position.x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menuRef.current.style.top = `${position.y - rect.height}px`;
    }
  }, [position]);

  const items = [
    ...(notification.navigateTo ? [{ label: 'Go to context', icon: ExternalLink, action: onNavigate }] : []),
    notification.unread
      ? { label: 'Mark as read', icon: Eye, action: onMarkRead }
      : { label: 'Mark as unread', icon: EyeOff, action: onMarkUnread },
    { label: 'Delete', icon: Trash2, action: onDelete, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-white rounded-xl border border-border shadow-lg py-1.5 animate-in fade-in zoom-in-95 duration-150"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); item.action(); onClose(); }}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-xs transition-colors ${
              'danger' in item && item.danger
                ? 'text-destructive hover:bg-destructive/5'
                : 'text-foreground hover:bg-secondary/60'
            }`}
            style={{ fontWeight: 'var(--font-weight-medium)' }}
          >
            <Icon size={14} className={'danger' in item && item.danger ? 'text-destructive' : 'text-muted'} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, unreadCount, markAllRead, markAsRead, markAsUnread, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationClick = (notification: WebNotification) => {
    if (notification.unread) markAsRead(notification.id);
    if (notification.navigateTo) navigate(notification.navigateTo);
  };

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  const handleThreeDotClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ id, x: rect.right - 180, y: rect.bottom + 4 });
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  if (notifications.length === 0) {
    return <NotificationsEmptyState />;
  }

  const contextNotification = contextMenu ? notifications.find(n => n.id === contextMenu.id) : null;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-foreground flex items-center gap-2 mb-1">
            Recent Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {unreadCount} new
              </span>
            )}
          </h3>
          <p className="text-xs text-muted">Stay updated with your latest activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          return (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              onContextMenu={(e) => handleContextMenu(e, notification.id)}
              className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
                notification.unread
                  ? 'bg-primary/[0.03] border-primary/15 hover:bg-primary/[0.06] hover:border-primary/25'
                  : 'bg-card border-border hover:bg-secondary/40 hover:border-border/80'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: config.bg, color: config.color }}
                >
                  <Icon size={18} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm truncate ${notification.unread ? 'text-foreground' : 'text-foreground/80'}`} style={{ fontWeight: notification.unread ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}>
                      {notification.title}
                    </p>
                    {notification.navigateTo && (
                      <ExternalLink size={12} className="shrink-0 text-muted opacity-0 group-hover:opacity-60 transition-opacity" />
                    )}
                  </div>
                  {notification.description && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{notification.description}</p>
                  )}
                </div>
                {/* Time + actions */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <span className="text-[11px] text-muted">{notification.time}</span>
                  {notification.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px rgba(47,128,237,0.4)' }} />
                  )}
                  {/* Three-dot menu */}
                  <button
                    onClick={(e) => handleThreeDotClick(e, notification.id)}
                    className="p-1 rounded-md text-muted opacity-0 group-hover:opacity-100 hover:bg-secondary/80 hover:text-foreground transition-all"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && contextNotification && (
        <NotificationContextMenu
          notification={contextNotification}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onMarkRead={() => markAsRead(contextNotification.id)}
          onMarkUnread={() => markAsUnread(contextNotification.id)}
          onDelete={() => deleteNotification(contextNotification.id)}
          onNavigate={() => {
            if (contextNotification.unread) markAsRead(contextNotification.id);
            if (contextNotification.navigateTo) navigate(contextNotification.navigateTo);
          }}
        />
      )}
    </div>
  );
}
