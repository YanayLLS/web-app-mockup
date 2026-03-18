import { useState, useMemo } from 'react';
import { useProject, ActivityLog, ActivityAction, ActivityCategory } from '../../contexts/ProjectContext';
import { MemberAvatar } from '../MemberAvatar';
import {
  Search,
  Filter,
  X,
  FileText,
  Box,
  Settings,
  Users,
  Database,
  Plus,
  Edit,
  Trash2,
  Upload,
  Link as LinkIcon,
  Unlink,
  GitBranch,
  FolderInput,
  Share2,
  Check,
  Clock,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

function ActivityLogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="p-5 bg-destructive/10 rounded-full mb-4">
            <AlertTriangle size={36} className="text-destructive" />
          </div>
          <h3 className="text-base text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Failed to load activity log
          </h3>
          <p className="text-sm text-muted mb-6">
            Something went wrong while loading the activity data. Please try again.
          </p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActivityLogPage() {
  const { activityLogs } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<ActivityAction[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ActivityCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set(activityLogs.map(log => log.user));
    return Array.from(users).sort();
  }, [activityLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          log.itemName.toLowerCase().includes(query) ||
          log.user.toLowerCase().includes(query) ||
          log.details?.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // User filter
      if (selectedUsers.length > 0 && !selectedUsers.includes(log.user)) {
        return false;
      }

      // Action filter
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(log.category)) {
        return false;
      }

      return true;
    });
  }, [activityLogs, searchQuery, selectedUsers, selectedActions, selectedCategories]);

  // Helper to get action icon
  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case 'created': return <Plus size={14} />;
      case 'updated': return <Edit size={14} />;
      case 'deleted': return <Trash2 size={14} />;
      case 'published': return <Upload size={14} />;
      case 'unpublished': return <Upload size={14} />;
      case 'connected': return <LinkIcon size={14} />;
      case 'disconnected': return <Unlink size={14} />;
      case 'renamed': return <GitBranch size={14} />;
      case 'moved': return <FolderInput size={14} />;
      case 'shared': return <Share2 size={14} />;
      default: return <Edit size={14} />;
    }
  };

  // Helper to get action color
  const getActionColor = (action: ActivityAction) => {
    switch (action) {
      case 'created': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'updated': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'deleted': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'published': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'unpublished': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'connected': return 'bg-accent/10 text-accent border-accent/20';
      case 'disconnected': return 'bg-muted/30 text-muted border-border';
      case 'renamed': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'moved': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'shared': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      default: return 'bg-secondary text-foreground border-border';
    }
  };

  // Helper to get category icon
  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'knowledge-base': return <Database size={14} />;
      case 'digital-twin': return <Box size={14} />;
      case 'procedure': return <FileText size={14} />;
      case 'session': return <Clock size={14} />;
      case 'settings': return <Settings size={14} />;
      case 'user': return <Users size={14} />;
      default: return <FileText size={14} />;
    }
  };

  // Helper to format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };


  // Toggle filter selections
  const toggleUser = (user: string) => {
    setSelectedUsers(prev => 
      prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user]
    );
  };

  const toggleAction = (action: ActivityAction) => {
    setSelectedActions(prev => 
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const toggleCategory = (category: ActivityCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedUsers([]);
    setSelectedActions([]);
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedUsers.length > 0 || selectedActions.length > 0 || selectedCategories.length > 0 || searchQuery;

  const allActions: ActivityAction[] = ['created', 'updated', 'deleted', 'published', 'unpublished', 'connected', 'disconnected', 'renamed', 'moved', 'shared'];
  const allCategories: ActivityCategory[] = ['knowledge-base', 'digital-twin', 'procedure', 'session', 'settings', 'user'];

  if (hasError) {
    return <ActivityLogErrorState onRetry={() => setHasError(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Activity Log
            </h1>
            <p className="text-sm text-muted/70">
              Track all changes and activities in your project
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 h-9 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 h-9 border rounded-lg text-sm transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-secondary border-border text-foreground hover:bg-secondary/80'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters ? (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {selectedUsers.length + selectedActions.length + selectedCategories.length}
                </span>
              ) : !showFilters ? (
                <span className="text-[10px] text-muted ml-0.5">
                  {showFilters ? '' : `${uniqueUsers.length} users`}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-3 h-10 bg-secondary/30 border border-border rounded-lg focus-within:border-primary focus-within:bg-card focus-within:shadow-sm focus-within:shadow-primary/5 transition-all">
          <Search size={15} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none ring-0 border-none placeholder:text-muted focus:outline-none focus:ring-0"
          />
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {selectedUsers.map(user => (
              <button
                key={user}
                onClick={() => toggleUser(user)}
                className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary hover:bg-primary/20 transition-colors group"
              >
                <span>{user}</span>
                <X size={12} className="opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            {selectedActions.map(action => (
              <button
                key={action}
                onClick={() => toggleAction(action)}
                className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent hover:bg-accent/20 transition-colors group capitalize"
              >
                <span>{action}</span>
                <X size={12} className="opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            {selectedCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-1.5 px-2 py-1 bg-secondary border border-border rounded-full text-xs text-foreground hover:bg-secondary/80 transition-colors group capitalize"
              >
                <span>{category.replace('-', ' ')}</span>
                <X size={12} className="opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-1 min-h-0">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-full sm:w-64 shrink-0 border-b sm:border-b-0 sm:border-r border-border bg-card overflow-y-auto custom-scrollbar max-h-[40vh] sm:max-h-none">
            <div className="p-4">
              {/* Users Filter */}
              <div className="mb-6">
                <h3 className="text-xs text-muted mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  USERS
                </h3>
                <div className="space-y-1">
                  {uniqueUsers.map(user => (
                    <label
                      key={user}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user)}
                          onChange={() => toggleUser(user)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MemberAvatar name={user} size="sm" showProfileOnClick={false} />
                        <span className="text-sm text-foreground truncate">{user}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions Filter */}
              <div className="mb-6">
                <h3 className="text-xs text-muted mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  ACTIONS
                </h3>
                <div className="space-y-1">
                  {allActions.map(action => (
                    <label
                      key={action}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedActions.includes(action)}
                        onChange={() => toggleAction(action)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${getActionColor(action)}`}>
                          {getActionIcon(action)}
                        </span>
                        <span className="text-sm text-foreground capitalize">{action}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="text-xs text-muted mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  CATEGORIES
                </h3>
                <div className="space-y-1">
                  {allCategories.map(category => (
                    <label
                      key={category}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-muted">{getCategoryIcon(category)}</span>
                        <span className="text-sm text-foreground capitalize">{category.replace('-', ' ')}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, rgba(47,128,237,0.08), rgba(47,128,237,0.03))', border: '1px solid rgba(47,128,237,0.1)', boxShadow: '0 8px 32px rgba(47,128,237,0.06)' }}>
                  <Database size={28} className="text-primary/40" />
                </div>
                <p className="text-[15px] text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  No activities found
                </p>
                <p className="text-xs text-muted max-w-[260px] leading-relaxed">
                  {hasActiveFilters ? 'Try adjusting your filters to see results' : 'Activities will appear here as you make changes'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {filteredLogs.map((log, index) => {
                  const isFirstOfDay = index === 0 || 
                    new Date(log.timestamp).toDateString() !== new Date(filteredLogs[index - 1].timestamp).toDateString();

                  return (
                    <div key={log.id}>
                      {/* Day Separator */}
                      {isFirstOfDay && (
                        <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
                          <div className="h-px bg-border flex-1" />
                          <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {new Date(log.timestamp).toDateString() === new Date().toDateString()
                              ? 'Today'
                              : new Date(log.timestamp).toDateString() === new Date(Date.now() - 86400000).toDateString()
                              ? 'Yesterday'
                              : new Date(log.timestamp).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'long', 
                                  day: 'numeric',
                                  year: new Date(log.timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                })}
                          </span>
                          <div className="h-px bg-border flex-1" />
                        </div>
                      )}

                      {/* Activity Item */}
                      <div className="group flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition-all">
                        {/* User Avatar */}
                        <MemberAvatar name={log.user} size="2xl" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                {log.user}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getActionColor(log.action)}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                {getActionIcon(log.action)}
                                {log.action}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs text-muted">
                                {getCategoryIcon(log.category)}
                                {log.category.replace('-', ' ')}
                              </span>
                            </div>
                            <span className="text-xs text-muted whitespace-nowrap">
                              {formatTimeAgo(log.timestamp)}
                            </span>
                          </div>

                          {/* Item Name */}
                          <div className="mb-1">
                            <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                              {log.itemName}
                            </span>
                            {log.itemType && (
                              <span className="ml-2 text-xs text-muted capitalize">
                                ({log.itemType.replace('-', ' ')})
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          {log.details && (
                            <p className="text-sm text-muted mb-2">
                              {log.details}
                            </p>
                          )}

                          {/* Metadata */}
                          {log.metadata && (
                            <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                              {log.metadata.from && log.metadata.to && (
                                <div className="flex items-center gap-2 text-muted">
                                  <span className="px-2 py-1 bg-secondary rounded border border-border">
                                    {log.metadata.from}
                                  </span>
                                  <span>→</span>
                                  <span className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary">
                                    {log.metadata.to}
                                  </span>
                                </div>
                              )}
                              {log.metadata.relatedItemName && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 border border-accent/20 rounded text-accent">
                                  <LinkIcon size={12} />
                                  <span>{log.metadata.relatedItemName}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
