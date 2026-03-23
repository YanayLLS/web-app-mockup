import { useState, useRef, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  CheckCircle,
  RotateCcw,
  Filter,
  AtSign,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemberAvatar } from '../../MemberAvatar';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  text: string;
  mentions: string[];
  createdAt: string;
  editedAt?: string;
  reactions?: { emoji: string; userNames: string[] }[];
}

export interface CommentThread {
  id: string;
  nodeId: string;
  resolved: boolean;
  comments: Comment[];
  createdAt: string;
}

interface WorkspaceUser {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface CommentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  threads: CommentThread[];
  onAddComment: (nodeId: string, threadId: string | null, text: string, mentions: string[]) => void;
  onResolveThread: (threadId: string) => void;
  onUnresolveThread: (threadId: string) => void;
  selectedNodeId: string | null;
  selectedNodeTitle: string | null;
  workspaceUsers: WorkspaceUser[];
  allNodeNames: Map<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function renderCommentText(text: string, users: WorkspaceUser[]): React.ReactNode {
  const parts = text.split(/(@\w[\w\s]*?\b)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const mentionName = part.slice(1);
      const user = users.find(u => u.name.toLowerCase().startsWith(mentionName.toLowerCase()));
      if (user) {
        return (
          <span key={i} className="font-semibold" style={{ color: 'var(--primary)' }}>
            {part}
          </span>
        );
      }
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

type FilterMode = 'all' | 'unresolved' | 'resolved';
type ViewMode = 'selected' | 'all';

export function CommentPanel({
  isOpen,
  onClose,
  threads,
  onAddComment,
  onResolveThread,
  onUnresolveThread,
  selectedNodeId,
  selectedNodeTitle,
  workspaceUsers,
  allNodeNames,
}: CommentPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('selected');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [commentText, setCommentText] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Auto-switch to selected when a node is clicked
  useEffect(() => {
    if (selectedNodeId) {
      setViewMode('selected');
    }
  }, [selectedNodeId]);

  // Filter threads
  const filteredThreads = threads.filter(t => {
    if (viewMode === 'selected' && t.nodeId !== selectedNodeId) return false;
    if (filterMode === 'unresolved' && t.resolved) return false;
    if (filterMode === 'resolved' && !t.resolved) return false;
    return true;
  });

  // Sort: unresolved first, then by date
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Group by node for "all" view
  const groupedByNode = viewMode === 'all'
    ? sortedThreads.reduce((acc, thread) => {
        if (!acc.has(thread.nodeId)) acc.set(thread.nodeId, []);
        acc.get(thread.nodeId)!.push(thread);
        return acc;
      }, new Map<string, CommentThread[]>())
    : null;

  const handleSendComment = () => {
    if (!commentText.trim() || !selectedNodeId) return;

    // Extract mentions
    const mentionMatches = commentText.match(/@(\w[\w\s]*?\b)/g) || [];
    const mentionIds = mentionMatches
      .map(m => m.slice(1))
      .map(name => workspaceUsers.find(u => u.name.toLowerCase().startsWith(name.toLowerCase()))?.id)
      .filter(Boolean) as string[];

    // Find existing thread for this node or create new
    const existingThread = threads.find(t => t.nodeId === selectedNodeId && !t.resolved);
    onAddComment(selectedNodeId, existingThread?.id || null, commentText.trim(), mentionIds);
    setCommentText('');
    setShowMentionDropdown(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleTextChange = (value: string) => {
    setCommentText(value);
    // Check for @ trigger
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex >= 0 && (lastAtIndex === 0 || value[lastAtIndex - 1] === ' ')) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ') || afterAt.length < 20) {
        setMentionFilter(afterAt);
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);
  };

  const insertMention = (user: WorkspaceUser) => {
    const lastAtIndex = commentText.lastIndexOf('@');
    const before = commentText.slice(0, lastAtIndex);
    setCommentText(`${before}@${user.name} `);
    setShowMentionDropdown(false);
    inputRef.current?.focus();
  };

  const filteredMentionUsers = workspaceUsers.filter(u =>
    u.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const totalUnresolved = threads.filter(t => !t.resolved).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 z-40 flex flex-col"
          onWheel={(e) => e.stopPropagation()}
          style={{
            width: 'min(400px, 100%)',
            backgroundColor: 'var(--card)',
            borderLeft: '1px solid var(--border)',
            boxShadow: 'var(--elevation-lg)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                Comments
              </span>
              {totalUnresolved > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  {totalUnresolved}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="p-1.5 rounded hover:bg-secondary transition-colors"
                  title="Filter"
                >
                  <Filter className="w-3.5 h-3.5" style={{ color: filterMode !== 'all' ? 'var(--primary)' : 'var(--muted)' }} />
                </button>
                {showFilterMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 rounded-lg border shadow-lg z-50 py-1 min-w-[140px]"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--elevation-lg)',
                    }}
                  >
                    {(['all', 'unresolved', 'resolved'] as FilterMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => { setFilterMode(mode); setShowFilterMenu(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors capitalize flex items-center justify-between"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {mode}
                        {filterMode === mode && (
                          <CheckCircle className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
            {(['selected', 'all'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex-1 py-2 text-xs font-medium transition-colors relative"
                style={{
                  color: viewMode === mode ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                {mode === 'selected' ? (selectedNodeTitle || 'Select a node') : 'All Comments'}
                {viewMode === mode && (
                  <div
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Thread List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
            {sortedThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
                <MessageSquare className="w-10 h-10 mb-3" style={{ color: 'var(--border)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  {viewMode === 'selected' && !selectedNodeId
                    ? 'Select a node'
                    : 'No comments yet'
                  }
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {viewMode === 'selected' && !selectedNodeId
                    ? 'Click on a node to see its comments'
                    : 'Start a conversation by adding a comment below'
                  }
                </p>
              </div>
            ) : viewMode === 'all' && groupedByNode ? (
              // Grouped by node view
              Array.from(groupedByNode.entries()).map(([nodeId, nodeThreads]) => (
                <div key={nodeId}>
                  <div
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--muted)',
                    }}
                  >
                    {allNodeNames.get(nodeId) || 'Unknown Node'}
                  </div>
                  {nodeThreads.map(thread => (
                    <ThreadItem
                      key={thread.id}
                      thread={thread}
                      workspaceUsers={workspaceUsers}
                      onResolve={() => onResolveThread(thread.id)}
                      onUnresolve={() => onUnresolveThread(thread.id)}
                    />
                  ))}
                </div>
              ))
            ) : (
              // Flat list for selected node
              sortedThreads.map(thread => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  workspaceUsers={workspaceUsers}
                  onResolve={() => onResolveThread(thread.id)}
                  onUnresolve={() => onUnresolveThread(thread.id)}
                />
              ))
            )}
          </div>

          {/* Comment Input */}
          {selectedNodeId && viewMode === 'selected' && (
            <div className="border-t px-3 py-3 shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder="Add a comment... (@ to mention)"
                  rows={2}
                  className="w-full text-xs border rounded-lg px-3 py-2 pr-10 focus:outline-none resize-none"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
                <div className="absolute right-1 bottom-1 flex items-center gap-0.5">
                  <button
                    onClick={() => setShowMentionDropdown(!showMentionDropdown)}
                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                    title="Mention someone"
                  >
                    <AtSign className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                  </button>
                  <button
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      color: commentText.trim() ? 'var(--primary)' : 'var(--muted)',
                      opacity: commentText.trim() ? 1 : 0.5,
                    }}
                    title="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mention Dropdown */}
                <AnimatePresence>
                  {showMentionDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full mb-1 left-0 right-0 rounded-lg border shadow-lg z-50 py-1 max-h-[160px] overflow-y-auto"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--elevation-lg)',
                      }}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                        Team Members
                      </div>
                      {filteredMentionUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => insertMention(user)}
                          className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary transition-colors"
                        >
                          <MemberAvatar
                            name={user.name}
                            id={user.id}
                            initials={user.initials}
                            color={user.color}
                            size="sm"
                          />
                          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            {user.name}
                          </span>
                        </button>
                      ))}
                      {filteredMentionUsers.length === 0 && (
                        <div className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>
                          No matching users
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Thread Item Sub-component ───────────────────────────────────────────────

function ThreadItem({
  thread,
  workspaceUsers,
  onResolve,
  onUnresolve,
}: {
  thread: CommentThread;
  workspaceUsers: WorkspaceUser[];
  onResolve: () => void;
  onUnresolve: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(thread.resolved);

  return (
    <div
      className="border-b last:border-b-0"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Thread header */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => thread.resolved && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          {thread.resolved && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(17, 232, 116, 0.1)',
                color: '#11E874',
              }}
            >
              Resolved
            </span>
          )}
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
            {thread.comments.length} comment{thread.comments.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {thread.resolved ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnresolve();
                setIsCollapsed(false);
              }}
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Unresolve"
            >
              <RotateCcw className="w-3 h-3" style={{ color: 'var(--muted)' }} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve();
                setIsCollapsed(true);
              }}
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Resolve thread"
            >
              <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            </button>
          )}
          {thread.resolved && (
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              style={{ color: 'var(--muted)' }}
            />
          )}
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex flex-col gap-3">
              {thread.comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <MemberAvatar
                    name={comment.authorName}
                    id={comment.authorId}
                    initials={comment.authorInitials}
                    color={comment.authorColor}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                        {comment.authorName}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--foreground)' }}>
                      {renderCommentText(comment.text, workspaceUsers)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
