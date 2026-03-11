import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Menu, MoreVertical, Mic, Send, ThumbsUp, ThumbsDown, X, MessageSquare, Plus, Wrench } from 'lucide-react';
import { getSmartAIResponse, streamResponse, ProjectInfo } from '../../../utils/aiResponses';
import { useProject } from '../../../contexts/ProjectContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const chatHistory = [
  { id: '1', title: 'Fuel Tank Replacement', time: '2h ago' },
  { id: '2', title: 'Engine Not Starting', time: '5h ago' },
  { id: '3', title: 'Replacing a Belt on a Tiller', time: 'Yesterday' },
  { id: '4', title: 'Overheating Issue', time: '2 days ago' },
  { id: '5', title: 'Oil Leak', time: '3 days ago' },
  { id: '6', title: 'Brake Malfunction', time: '1 week ago' },
];

const suggestions = [
  'List my procedures',
  'Tell me about the Generator',
  'Which machines are supported?',
  'Guide me',
];

/** Render simple markdown: **bold**, bullet points, headings, checkboxes, table rows */
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Process inline bold
    const processInline = (str: string) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} style={{ fontWeight: 'var(--font-weight-bold)' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    // Checkbox lines
    if (line.match(/^☐ /)) {
      return <div key={i} style={{ paddingLeft: '4px' }}>{'☐ '}{processInline(line.slice(2))}</div>;
    }
    // Bullet points
    if (line.match(/^[•\-] /)) {
      return <div key={i} style={{ paddingLeft: '12px', textIndent: '-12px' }}>{processInline(line)}</div>;
    }
    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      return <div key={i} style={{ paddingLeft: '8px' }}>{processInline(line)}</div>;
    }
    // Table-like rows
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.match(/^\|[\s-|]+\|$/)) return null; // separator row
      return <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{processInline(line)}</div>;
    }
    // Empty line
    if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
    // Regular line
    return <div key={i}>{processInline(line)}</div>;
  });
}

export function AppAIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { projects } = useProject();

  // Convert project data to the format the AI engine expects
  const projectInfos: ProjectInfo[] = projects.map(p => ({
    name: p.name,
    items: (function flatten(items: typeof p.knowledgeBaseItems): ProjectInfo['items'] {
      return items.map(item => ({
        name: item.name,
        type: item.type,
        description: item.description,
        isPublished: item.isPublished,
        createdBy: item.createdBy,
        lastEdited: item.lastEdited,
        children: item.children ? flatten(item.children) : undefined,
      }));
    })(p.knowledgeBaseItems),
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cycle through thinking stages
  useEffect(() => {
    if (!isTyping) { setThinkingStage(0); return; }
    const timer = setInterval(() => {
      setThinkingStage(prev => (prev + 1) % 3);
    }, 1200);
    return () => clearInterval(timer);
  }, [isTyping]);

  const cancelStreamRef = useRef<(() => void) | null>(null);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Cancel any in-progress stream
    cancelStreamRef.current?.();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setFeedbackText('');

    const fullResponse = getSmartAIResponse(messageText, projectInfos);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Start streaming after a brief "thinking" pause
    const thinkTimer = setTimeout(() => {
      setIsTyping(false);
      // Add empty assistant message that will be streamed into
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp }]);

      cancelStreamRef.current = streamResponse(
        fullResponse,
        (partial) => {
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: partial } : m));
        },
        () => {
          cancelStreamRef.current = null;
          setShowFeedback(true);
        },
      );
    }, 600 + Math.random() * 600);

    // Also allow cancelling the think timer
    const originalCancel = cancelStreamRef.current;
    cancelStreamRef.current = () => {
      clearTimeout(thinkTimer);
      originalCancel?.();
    };
  }, [input]);

  const handleFeedbackSubmit = () => {
    setFeedbackSubmitted(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const filteredHistory = chatHistory.filter(c =>
    c.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  // Derive a context title from the last user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  const contextTitle = lastUserMessage
    ? lastUserMessage.content.length > 30
      ? lastUserMessage.content.slice(0, 30) + '...'
      : lastUserMessage.content
    : 'Stratocaster maintenance';

  return (
    <div className="h-full flex">
      {/* Chat history sidebar - responsive */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 lg:relative lg:inset-auto flex">
          {/* Overlay on mobile */}
          <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setShowSidebar(false)} />

          <div className="relative w-72 bg-card border-r border-border flex flex-col z-50">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-secondary border-none outline-none text-foreground placeholder:text-muted"
                  />
                </div>
                <button
                  onClick={() => { setMessages([]); setShowFeedback(false); setFeedbackSubmitted(false); }}
                  className="p-1.5 hover:bg-secondary rounded-lg text-muted hover:text-foreground"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1.5 hover:bg-secondary rounded-lg text-muted hover:text-foreground lg:hidden"
                >
                  <X className="size-4" />
                </button>
              </div>
              <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Your chats</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredHistory.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full px-3 py-2.5 text-left hover:bg-secondary transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-foreground truncate">{chat.title}</span>
                  <span className="text-xs text-muted shrink-0 ml-2">{chat.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 sm:p-1.5 hover:bg-secondary rounded-lg text-muted hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            Iris
          </span>
          <div className="flex-1" />
          <button className="p-2 sm:p-1.5 hover:bg-secondary rounded-lg text-muted hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
            <MoreVertical className="size-5" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          {messages.length === 0 ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-lg text-primary mb-4" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                What can I help with?
              </p>
              <div className="flex flex-wrap gap-2 justify-center px-4">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-4 py-2.5 min-h-[44px] border border-primary/30 text-primary rounded-full text-sm hover:bg-primary/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm
                      ${msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-card text-foreground rounded-bl-md border border-border'
                      }`}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-muted'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {['Thinking...', 'Searching knowledge base...', 'Generating response...'][thinkingStage]}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating feedback card */}
          {showFeedback && messages.length > 0 && (
            <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-[calc(100vw-32px)] sm:w-80 max-w-80">
              <div className="bg-card border border-border rounded-[var(--radius)] shadow-elevation-lg overflow-hidden">
                {/* Close button */}
                <button
                  onClick={() => setShowFeedback(false)}
                  className="absolute top-2 right-2 p-1 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors z-10"
                >
                  <X className="size-4" />
                </button>

                {feedbackSubmitted ? (
                  <div className="p-6 text-center">
                    <div className="size-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
                      <ThumbsUp className="size-6 text-accent" />
                    </div>
                    <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      Thank you for your feedback!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Context header */}
                    <div className="px-4 pt-4 pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Wrench className="size-4 text-primary" />
                        <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {contextTitle}
                        </span>
                      </div>
                    </div>

                    {/* Feedback question */}
                    <div className="p-4">
                      <p className="text-sm text-foreground mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        Did it help you?
                      </p>

                      {/* Thumbs options */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius)] border border-border hover:border-destructive hover:bg-destructive/5 transition-all group">
                          <ThumbsDown className="size-6 text-muted group-hover:text-destructive transition-colors" />
                          <span className="text-xs text-muted group-hover:text-destructive transition-colors" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            Need more help
                          </span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius)] border border-border hover:border-accent hover:bg-accent/5 transition-all group">
                          <ThumbsUp className="size-6 text-muted group-hover:text-accent transition-colors" />
                          <span className="text-xs text-muted group-hover:text-accent transition-colors" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            Yes
                          </span>
                        </button>
                      </div>

                      {/* Feedback text input */}
                      <input
                        type="text"
                        placeholder="Add your feedback.."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg text-sm bg-secondary border border-border outline-none text-foreground placeholder:text-muted focus:border-primary mb-3"
                      />

                      {/* Submit button */}
                      <button
                        onClick={handleFeedbackSubmit}
                        className="w-full h-10 rounded-[25px] bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                        style={{ fontWeight: 'var(--font-weight-semibold)' }}
                      >
                        Submit feedback
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 sm:p-6 pt-2 border-t border-border bg-card" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 min-h-[48px]">
              <input
                type="text"
                placeholder="Message Iris"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted min-h-[44px]"
                style={{ fontSize: '16px' }}
              />
              <button className="p-2 sm:p-1.5 text-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Mic className="size-5" />
              </button>
              {input.trim() && (
                <button
                  onClick={() => handleSend()}
                  className="p-2 sm:p-1.5 text-primary hover:text-primary/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Send className="size-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted text-center mt-2">
              Iris can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
