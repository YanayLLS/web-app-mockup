import { useState, useRef } from 'react';
import { Bell, Check, MoreVertical, Trash2, CheckCheck, Mail, MailOpen } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  read: boolean;
  type: 'knowledge-base' | 'remote-support' | 'system';
}

export const initialAppNotifications: Notification[] = [
  { id: '3', title: 'Knowledge Base', description: 'Your flow "Belt Replacement Guide" was approved.', time: '08:00 AM', date: 'Today', read: false, type: 'knowledge-base' },
  { id: '4', title: 'System', description: 'System maintenance scheduled for tonight at 2:00 AM.', time: '4:30 PM', date: 'Aug 8', read: false, type: 'system' },
  { id: '5', title: 'Knowledge Base', description: 'Carlos Oliveira updated "Routine Maintenance" flow.', time: '2:15 PM', date: 'Aug 8', read: false, type: 'knowledge-base' },
  { id: '6', title: 'Remote Support', description: 'Missed call from Nika Jerrardo.', time: '11:00 AM', date: 'Aug 8', read: true, type: 'remote-support' },
  { id: '7', title: 'Knowledge Base', description: 'New digital twin "Hydraulic System" has been added.', time: '9:45 AM', date: 'Aug 6', read: true, type: 'knowledge-base' },
  { id: '8', title: 'System', description: 'Your account password will expire in 7 days.', time: '8:00 AM', date: 'Aug 6', read: true, type: 'system' },
];

const typeColors: Record<string, string> = {
  'knowledge-base': '#2F80ED',
  'remote-support': '#8404B3',
  'system': '#36415D',
};

interface SwipeState {
  id: string;
  offset: number;
  direction: 'left' | 'right' | null;
}

export function AppNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [notifs, setNotifs] = useState(initialAppNotifications);
  const [showMenu, setShowMenu] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const [revealedAction, setRevealedAction] = useState<{ id: string; direction: 'left' | 'right' } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; id: string } | null>(null);

  const filteredNotifs = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  // Group by date
  const grouped = filteredNotifs.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setShowMenu(false);
    setShowBottomSheet(false);
  };

  const deleteAll = () => {
    setNotifs([]);
    setShowMenu(false);
    setShowBottomSheet(false);
  };

  const markAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setRevealedAction(null);
  };

  const markAsUnread = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    setRevealedAction(null);
  };

  const deleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
    setRevealedAction(null);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, id };
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (!touchStartRef.current || touchStartRef.current.id !== id) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;

    // Only track horizontal swipes
    if (Math.abs(dy) > Math.abs(dx)) return;

    const direction = dx > 0 ? 'right' : 'left';
    const offset = Math.max(-100, Math.min(100, dx));
    setSwipeState({ id, offset, direction });
  };

  const handleTouchEnd = (id: string) => {
    if (!swipeState || swipeState.id !== id) {
      touchStartRef.current = null;
      return;
    }

    // If swiped far enough, reveal action
    if (Math.abs(swipeState.offset) > 60) {
      setRevealedAction({ id, direction: swipeState.direction! });
    } else {
      setRevealedAction(null);
    }

    setSwipeState(null);
    touchStartRef.current = null;
  };

  const getSwipeOffset = (id: string): number => {
    if (swipeState?.id === id) return swipeState.offset;
    if (revealedAction?.id === id) {
      return revealedAction.direction === 'left' ? -80 : 80;
    }
    return 0;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-card" style={{ paddingRight: '48px' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
            Notifications
          </h2>
          <div className="relative">
            {/* Desktop: dropdown menu */}
            <button
              onClick={() => {
                // On small screens, show bottom sheet; on desktop, show dropdown
                if (window.innerWidth < 640) {
                  setShowBottomSheet(true);
                } else {
                  setShowMenu(!showMenu);
                }
              }}
              className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MoreVertical className="size-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-[var(--radius)] shadow-elevation-lg border border-border z-10 py-1">
                <button
                  onClick={markAllRead}
                  className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                >
                  <CheckCheck className="size-4" /> Mark all as read
                </button>
                <button
                  onClick={deleteAll}
                  className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-secondary flex items-center gap-2"
                >
                  <Trash2 className="size-4" /> Delete all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5 w-fit">
          {(['all', 'read', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 min-h-[44px] rounded-md text-sm transition-colors capitalize
                ${filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
              style={{ fontWeight: filter === f ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <Bell className="size-12 mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Date header */}
              <div className="px-4 sm:px-6 py-2 bg-secondary/50">
                <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {date}
                </span>
              </div>
              {/* Items */}
              {items.map((notif) => {
                const offset = getSwipeOffset(notif.id);
                const isRevealed = revealedAction?.id === notif.id;

                return (
                  <div
                    key={notif.id}
                    className="relative overflow-hidden border-b border-border"
                  >
                    {/* Swipe action backgrounds — only visible during swipe or when revealed */}
                    {/* Left swipe - delete (red) */}
                    {(offset < 0 || (isRevealed && revealedAction?.direction === 'left')) && (
                      <div className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center">
                        <button
                          onClick={() => deleteNotif(notif.id)}
                          className="flex flex-col items-center gap-1 text-white"
                        >
                          <Trash2 className="size-5" />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    )}

                    {/* Right swipe - mark read/unread (gray) */}
                    {(offset > 0 || (isRevealed && revealedAction?.direction === 'right')) && (
                      <div className="absolute inset-y-0 left-0 w-20 bg-muted/30 flex items-center justify-center">
                        <button
                          onClick={() => notif.read ? markAsUnread(notif.id) : markAsRead(notif.id)}
                          className="flex flex-col items-center gap-1 text-foreground"
                        >
                          {notif.read ? <Mail className="size-5" /> : <MailOpen className="size-5" />}
                          <span className="text-xs">{notif.read ? 'Unread' : 'Read'}</span>
                        </button>
                      </div>
                    )}

                    {/* Notification content (slides) */}
                    <div
                      className={`relative flex items-start gap-3 px-4 sm:px-6 py-3 bg-card transition-transform cursor-pointer group
                        ${!notif.read ? 'bg-primary/5' : ''}`}
                      style={{
                        transform: `translateX(${offset}px)`,
                        transition: swipeState?.id === notif.id ? 'none' : 'transform 0.3s ease',
                      }}
                      onTouchStart={(e) => handleTouchStart(e, notif.id)}
                      onTouchMove={(e) => handleTouchMove(e, notif.id)}
                      onTouchEnd={() => handleTouchEnd(notif.id)}
                      onClick={() => {
                        if (!isRevealed) {
                          setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        } else {
                          setRevealedAction(null);
                        }
                      }}
                    >
                      {/* Unread indicator */}
                      <div className="pt-1.5 shrink-0">
                        {!notif.read ? (
                          <div className="size-2.5 rounded-full bg-primary" />
                        ) : (
                          <div className="size-2.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: typeColors[notif.type], fontWeight: 'var(--font-weight-medium)' }}
                          >
                            {notif.title}
                          </span>
                          <span className="text-xs text-muted">{notif.time}</span>
                        </div>
                        <p className="text-sm text-foreground">{notif.description}</p>
                      </div>

                      {/* Desktop hover actions */}
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); notif.read ? markAsUnread(notif.id) : markAsRead(notif.id); }}
                          className="p-1.5 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title={notif.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {notif.read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                          className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Mobile bottom sheet */}
      {showBottomSheet && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBottomSheet(false)} />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl overflow-hidden animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted/40" />
            </div>

            <div className="px-4 space-y-1" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
              <button
                onClick={markAllRead}
                className="w-full px-4 py-3.5 text-left text-sm text-foreground hover:bg-secondary rounded-[var(--radius)] flex items-center gap-3 transition-colors"
              >
                <CheckCheck className="size-5 text-muted" />
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Mark all as read</span>
              </button>
              <button
                onClick={deleteAll}
                className="w-full px-4 py-3.5 text-left text-sm text-destructive hover:bg-destructive/10 rounded-[var(--radius)] flex items-center gap-3 transition-colors"
              >
                <Trash2 className="size-5" />
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Delete all</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
