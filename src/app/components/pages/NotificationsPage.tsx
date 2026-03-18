import { useState, useEffect } from 'react';
import { Bell, MessageSquare, CheckCircle2, Users, Calendar, Check } from 'lucide-react';

export const webNotifications = [
  { id: 1, title: 'New comment on your document', time: '5 minutes ago', unread: true, type: 'comment' as const },
  { id: 2, title: 'Project Phoenix milestone completed', time: '1 hour ago', unread: true, type: 'milestone' as const },
  { id: 3, title: 'You were added to Quantum Leap Initiative', time: '3 hours ago', unread: false, type: 'team' as const },
  { id: 4, title: 'Meeting reminder: Team sync in 30 minutes', time: '5 hours ago', unread: false, type: 'meeting' as const },
];

type NotificationType = 'comment' | 'milestone' | 'team' | 'meeting';

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  comment: { icon: MessageSquare, color: '#2F80ED', bg: 'rgba(47,128,237,0.1)' },
  milestone: { icon: CheckCircle2, color: '#11E874', bg: 'rgba(17,232,116,0.1)' },
  team: { icon: Users, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  meeting: { icon: Calendar, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
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

export function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState(webNotifications);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = items.filter(n => n.unread).length;

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, unread: false })));
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  if (items.length === 0) {
    return <NotificationsEmptyState />;
  }

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
        {items.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          return (
            <div
              key={notification.id}
              className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
                notification.unread
                  ? 'bg-primary/[0.03] border-primary/15 hover:bg-primary/[0.06] hover:border-primary/25'
                  : 'bg-card border-border hover:bg-secondary/40 hover:border-border/80'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: config.bg, color: config.color }}
                >
                  <Icon size={18} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${notification.unread ? 'text-foreground' : 'text-foreground/80'}`} style={{ fontWeight: notification.unread ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}>
                    {notification.title}
                  </p>
                </div>
                {/* Time + unread dot */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted">{notification.time}</span>
                  {notification.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px rgba(47,128,237,0.4)' }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
