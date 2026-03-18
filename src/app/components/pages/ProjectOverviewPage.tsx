import { CheckCircle2, Clock, ListTodo, TrendingUp, FileText, Users, Activity } from 'lucide-react';

const recentActivity = [
  { action: 'completed', item: 'Design Review', user: 'Sarah Chen', time: '2 hours ago', color: '#11E874' },
  { action: 'added', item: 'API Specifications', user: 'Mike Johnson', time: '5 hours ago', color: '#2F80ED' },
  { action: 'joined', item: 'the project', user: 'Sarah Laurent', time: '1 day ago', color: '#8B5CF6' },
  { action: 'updated', item: 'Safety Protocol v2', user: 'Daniel Becker', time: '2 days ago', color: '#F59E0B' },
];

export function ProjectOverviewPage() {
  const totalTasks = 42;
  const completed = 28;
  const inProgress = 14;
  const progressPercent = Math.round((completed / totalTasks) * 100);

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-foreground flex items-center gap-2 mb-1">
          <span className="w-1 h-5 rounded-full bg-primary" />
          Project Overview
        </h3>
        <p className="text-xs text-muted">View high-level information and status of your project</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.1)', color: '#2F80ED' }}>
              <ListTodo size={20} />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
              <TrendingUp size={12} />
              <span className="text-[11px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>+5</span>
            </div>
          </div>
          <p className="text-2xl text-foreground mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>{totalTasks}</p>
          <p className="text-xs text-muted">Total Tasks</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 hover:border-[#11E874]/20 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(17,232,116,0.1)', color: '#0a9e4a' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#11E874]/10 text-[#0a9e4a]">
              <TrendingUp size={12} />
              <span className="text-[11px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>+8</span>
            </div>
          </div>
          <p className="text-2xl text-foreground mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>{completed}</p>
          <p className="text-xs text-muted">Completed</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 hover:border-[#F59E0B]/20 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
              <Clock size={20} />
            </div>
          </div>
          <p className="text-2xl text-foreground mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>{inProgress}</p>
          <p className="text-xs text-muted">In Progress</p>
        </div>
      </div>

      {/* Progress + Activity grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
            <span className="w-1 h-4 rounded-full bg-primary" />
            <h4 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Project Progress
            </h4>
          </div>
          <div className="p-5">
            {/* Circular-ish display */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--secondary)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#2F80ED" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${progressPercent * 2.64} ${264 - progressPercent * 2.64}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{progressPercent}%</span>
                </div>
              </div>
              <p className="text-xs text-muted">{completed} of {totalTasks} tasks completed</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#11E874]" />
                  <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Completed</span>
                </div>
                <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>In Progress</span>
                </div>
                <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{inProgress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#8B5CF6]" />
              <h4 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Recent Activity
              </h4>
            </div>
            <button className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
              View all
            </button>
          </div>
          <div className="p-2">
            {recentActivity.map((item, index) => (
              <div
                key={index}
                className="group flex items-center gap-4 px-4 py-3 hover:bg-secondary/40 rounded-lg transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                  style={{ backgroundColor: item.color, fontWeight: 'var(--font-weight-bold)' }}
                >
                  {item.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{item.user}</span>
                    {' '}<span className="text-muted">{item.action}</span>{' '}
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{item.item}</span>
                  </p>
                </div>

                {/* Time */}
                <span className="text-[11px] text-muted shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
