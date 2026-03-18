import { useState, useMemo } from 'react';
import {
  Clock,
  BookOpen,
  Video,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  PlayCircle,
  FileText,
  MessageSquare,
  Zap,
  CheckCircle2
} from 'lucide-react';
import svgPaths from "../../imports/svg-albmkprcym";
import { useRole, hasAccess } from '../contexts/RoleContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

function IconLogo() {
  return (
    <svg className="block w-full h-full" fill="none" viewBox="0 0 24 24">
      <g>
        <path d={svgPaths.p2e071580} fill="currentColor" />
        <path d={svgPaths.p159c9f80} fill="currentColor" />
        <path d={svgPaths.p50fb500} fill="currentColor" />
        <path d={svgPaths.p1f65b900} fill="currentColor" />
      </g>
    </svg>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6 hover:border-primary transition-all hover:shadow-[var(--elevation-sm)] flex flex-col items-start text-left group"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20 transition-all">
        {icon}
      </div>
      <h3 className="text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{title}</h3>
      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
        {description}
      </p>
      <div className="mt-4 flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
          Get started
        </span>
        <ArrowRight size={16} />
      </div>
    </button>
  );
}

interface RecentItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  timestamp: string;
  onClick?: () => void;
}

function RecentItem({ icon, title, subtitle, timestamp, onClick }: RecentItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 rounded-[var(--radius)] transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-foreground mb-0.5 truncate" style={{ fontSize: 'var(--text-base)' }}>
          {title}
        </h4>
        <p className="text-muted truncate" style={{ fontSize: 'var(--text-sm)' }}>
          {subtitle}
        </p>
      </div>
      <span className="text-muted flex-shrink-0" style={{ fontSize: 'var(--text-sm)' }}>
        {timestamp}
      </span>
    </button>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  accentColor?: string;
}

function StatCard({ icon, value, label, trend, trendUp, accentColor }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius)] p-5 hover:border-primary/20 hover:shadow-md transition-all" style={{ boxShadow: 'var(--elevation-sm)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!accentColor ? 'bg-primary/10 text-primary' : ''}`} style={accentColor ? { background: `${accentColor}12`, color: accentColor } : undefined}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-[var(--radius)] ${trendUp ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
            <TrendingUp size={12} className={trendUp ? '' : 'rotate-180'} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className="text-foreground mb-1" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)' }}>
        {value}
      </div>
      <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
        {label}
      </div>
    </div>
  );
}

interface HomePageProps {
  onNavigateToKnowledgeBase?: () => void;
  onNavigateToRemoteSupport?: () => void;
  onOpenAIChat?: () => void;
  onScheduleMeeting?: () => void;
}

export function HomePage({ 
  onNavigateToKnowledgeBase, 
  onNavigateToRemoteSupport, 
  onOpenAIChat,
  onScheduleMeeting
}: HomePageProps) {
  const [userName] = useState('John Smith');
  const { currentRole } = useRole();
  const { workspace: wsSettings } = useWorkspace();
  const canCreate = hasAccess(currentRole, 'create-content');
  const canRemoteSupport = hasAccess(currentRole, 'remote-support');
  const canAIChat = hasAccess(currentRole, 'ai-chat');
  const canSchedule = hasAccess(currentRole, 'schedule-meeting');

  const quickActions = useMemo(() => {
    const actions = [];
    if (canCreate) {
      actions.push({
        icon: <FileText size={24} />,
        title: 'Create Flow',
        description: 'Build step-by-step guides with our visual editor',
        onClick: onNavigateToKnowledgeBase,
      });
    }
    if (canRemoteSupport) {
      actions.push({
        icon: <Video size={24} />,
        title: 'Start Remote Support',
        description: 'Connect with team members for live assistance',
        onClick: onNavigateToRemoteSupport,
      });
    }
    if (canAIChat) {
      actions.push({
        icon: <MessageSquare size={24} />,
        title: 'Ask AI Assistant',
        description: 'Get instant help with flows and questions',
        onClick: onOpenAIChat,
      });
    }
    if (canSchedule) {
      actions.push({
        icon: <Calendar size={24} />,
        title: 'Schedule Meeting',
        description: 'Set up training or support sessions',
        onClick: onScheduleMeeting,
      });
    }
    return actions;
  }, [canCreate, canRemoteSupport, canAIChat, canSchedule, onNavigateToKnowledgeBase, onNavigateToRemoteSupport, onOpenAIChat, onScheduleMeeting]);

  const recentItems = [
    {
      icon: <FileText size={18} />,
      title: 'Product Assembly Guide',
      subtitle: 'Manufacturing → Updated by Sarah Chen',
      timestamp: '2 hours ago',
    },
    {
      icon: <FileText size={18} />,
      title: 'Customer Onboarding Flow',
      subtitle: 'Sales & Support → Created by Mike Johnson',
      timestamp: '5 hours ago',
    },
    {
      icon: <PlayCircle size={18} />,
      title: 'Training Session Recording',
      subtitle: 'Remote Support → Completed',
      timestamp: 'Yesterday',
    },
    {
      icon: <FileText size={18} />,
      title: 'Safety Protocol Update',
      subtitle: 'Operations → Updated by Emily Davis',
      timestamp: '2 days ago',
    },
    {
      icon: <MessageSquare size={18} />,
      title: 'AI Chat: Equipment Setup',
      subtitle: 'Knowledge Base → Question answered',
      timestamp: '3 days ago',
    },
  ];

  return (
    <>
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 sm:px-8 py-5 sm:py-7 border-b border-border/60 bg-card">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-foreground mb-1.5 truncate">Welcome back, {userName}</h1>
            <p className="text-muted/70" style={{ fontSize: 'var(--text-base)' }}>
              Here's what's happening with your workspace today
            </p>
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary p-2.5 sm:p-3 shrink-0 overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(47,128,237,0.08)' }}>
            {wsSettings.logoUrl ? (
              <img src={wsSettings.logoUrl} alt="" className="w-full h-full object-contain" />
            ) : (
              <IconLogo />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Overview */}
          <section>
            <h2 className="text-foreground mb-4 flex items-center gap-2"><span className="w-1 h-5 rounded-full bg-primary" />Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                icon={<FileText size={20} />}
                value="142"
                label="Total Flows"
                trend="+12%"
                trendUp={true}
                accentColor="#2F80ED"
              />
              <StatCard
                icon={<Users size={20} />}
                value="24"
                label="Active Team Members"
                trend="+8%"
                trendUp={true}
                accentColor="#8B5CF6"
              />
              <StatCard
                icon={<Video size={20} />}
                value="18"
                label="Support Sessions This Week"
                trend="+15%"
                trendUp={true}
                accentColor="#11E874"
              />
              <StatCard
                icon={<CheckCircle2 size={20} />}
                value="96%"
                label="Completion Rate"
                trend="+3%"
                trendUp={true}
                accentColor="#F59E0B"
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-foreground mb-4 flex items-center gap-2"><span className="w-1 h-5 rounded-full bg-primary" />Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </div>
          </section>

          {/* Recent Activity & Upcoming */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Activity */}
            <section className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-primary" />
                    <h3 className="text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Recent Activity</h3>
                  </div>
                  <button className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                    View all
                  </button>
                </div>
                <div className="p-2">
                  {recentItems.map((item, index) => (
                    <RecentItem key={index} {...item} />
                  ))}
                </div>
              </div>
            </section>

            {/* Right Column */}
            <section className="space-y-6">
              {/* Upcoming Meetings */}
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-border/60">
                  <span className="w-1 h-4 rounded-full bg-[#8B5CF6]" />
                  <h3 className="text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Upcoming</h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border/40 last:border-0 last:mb-0 last:pb-0">
                    <div className="w-12 h-12 rounded-xl bg-[#11E874]/10 flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-[#0a9e4a] text-sm leading-none" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        15
                      </div>
                      <div className="text-[#0a9e4a] text-[9px] uppercase mt-0.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        FEB
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)' }}>
                        Team Training
                      </h4>
                      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        New flow walkthrough
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        <Clock size={14} />
                        <span>2:00 PM - 3:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-primary text-sm leading-none" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        16
                      </div>
                      <div className="text-primary text-[9px] uppercase mt-0.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                        FEB
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)' }}>
                        Support Session
                      </h4>
                      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        Remote assistance call
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        <Clock size={14} />
                        <span>10:00 AM - 11:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
                {canSchedule && (
                <div className="px-6 py-4 border-t border-border/40">
                  <button
                    onClick={onScheduleMeeting}
                    className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}
                  >
                    <Calendar size={16} />
                    <span>Schedule New Meeting</span>
                  </button>
                </div>
                )}
              </div>

              {/* Quick Tip */}
              <div className="bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(47,128,237,0.25)' }}>
                    <Zap size={14} />
                  </div>
                  <h4 className="text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Pro Tip</h4>
                </div>
                <p className="text-foreground mb-4" style={{ fontSize: 'var(--text-sm)' }}>
                  Use the AI Assistant to quickly generate procedure templates based on your workflow descriptions.
                </p>
                {canAIChat && (
                <button
                  onClick={onOpenAIChat}
                  className="text-primary hover:underline flex items-center gap-1 px-2 py-1.5"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
                >
                  <span>Try it now</span>
                  <ArrowRight size={14} />
                </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
