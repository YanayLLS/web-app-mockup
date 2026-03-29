import { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType =
  | 'comment'
  | 'milestone'
  | 'team'
  | 'meeting'
  | 'project'
  | 'procedure'
  | 'publish'
  | 'remote-support'
  | 'role'
  | 'mention'
  | 'system'
  | 'ai';

export interface WebNotification {
  id: number;
  title: string;
  description?: string;
  time: string;
  unread: boolean;
  type: NotificationType;
  /** Route path to navigate to for context, e.g. '/web/remote-support' */
  navigateTo?: string;
}

const defaultNotifications: WebNotification[] = [
  // Comments & collaboration
  { id: 1, title: 'New comment on "Safety Inspection Checklist"', description: 'David K. commented: "Should we add a step for PPE verification?"', time: '5 minutes ago', unread: true, type: 'comment', navigateTo: '/web/project/project-phoenix' },
  { id: 2, title: 'You were mentioned in a comment', description: 'Sarah M. mentioned you on "Hydraulic System Maintenance" procedure', time: '12 minutes ago', unread: true, type: 'mention', navigateTo: '/web/project/project-phoenix' },

  // Procedures & publishing
  { id: 3, title: 'Procedure approved and published', description: '"Belt Replacement Guide" is now live in Project Phoenix', time: '30 minutes ago', unread: true, type: 'publish', navigateTo: '/web/project/project-phoenix' },
  { id: 4, title: 'Procedure update requires review', description: '"Emergency Shutdown Protocol" was updated by Alex R. and needs approval', time: '1 hour ago', unread: true, type: 'procedure', navigateTo: '/web/project/project-phoenix' },

  // Project events
  { id: 5, title: 'You were added to Quantum Leap Initiative', description: 'Rachel T. added you as a team member', time: '2 hours ago', unread: true, type: 'team', navigateTo: '/web/project/quantum-leap' },
  { id: 6, title: 'New project created', description: '"Factory Floor Redesign" was created by Michael B.', time: '3 hours ago', unread: false, type: 'project', navigateTo: '/web/home' },

  // Milestones & tasks
  { id: 7, title: 'Project Phoenix milestone completed', description: 'All 12 procedures in Phase 1 have been published', time: '4 hours ago', unread: false, type: 'milestone', navigateTo: '/web/project/project-phoenix' },

  // Remote support
  { id: 8, title: 'Missed remote support call', description: 'James L. tried to reach you for support on Line 4 assembly', time: '5 hours ago', unread: false, type: 'remote-support', navigateTo: '/web/remote-support' },
  { id: 9, title: 'Remote support session recorded', description: 'Session with Operator Team B (28 min) is available for review', time: 'Yesterday', unread: false, type: 'remote-support', navigateTo: '/web/remote-support' },

  // AI Studio
  { id: 10, title: 'AI translation completed', description: '8 procedures translated to Spanish and German — ready for review', time: 'Yesterday', unread: false, type: 'ai', navigateTo: '/web/ai-studio' },

  // Role & permissions
  { id: 11, title: 'Your role was updated', description: 'You have been promoted to Content Creator by Admin', time: 'Yesterday', unread: false, type: 'role' },

  // System
  { id: 12, title: 'Scheduled maintenance tonight', description: 'System will be unavailable from 2:00 AM to 4:00 AM EST', time: '2 days ago', unread: false, type: 'system' },

  // More collaboration
  { id: 13, title: 'Meeting reminder: Weekly sync in 30 min', description: 'Project Phoenix team standup — 4 attendees confirmed', time: '2 days ago', unread: false, type: 'meeting' },
  { id: 14, title: 'New media uploaded to Knowledge Base', description: 'Lisa P. added 3 training videos to "Onboarding Materials"', time: '3 days ago', unread: false, type: 'project', navigateTo: '/web/project/project-phoenix' },
];

interface NotificationContextType {
  notifications: WebNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markAsRead: (id: number) => void;
  markAsUnread: (id: number) => void;
  deleteNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<WebNotification[]>(defaultNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAsUnread = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markAsRead, markAsUnread, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
