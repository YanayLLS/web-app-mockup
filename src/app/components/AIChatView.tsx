import { useState, useRef, useEffect, useCallback } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { Paperclip, Send, Mic, X, Loader2, ChevronDown, Search, Plus, MessageSquare, Clock, Camera, FolderOpen, Upload, Menu, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, AlertCircle, ArrowDown, Bug, Trash2, MicOff, History, Settings2, Undo2, FileText, Folder, Wrench, Sparkles, MoreVertical, Edit2, Save } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { MediaLibraryModal } from './MediaLibraryModal';
import { ModelSelector } from './ModelSelector';
import generatorImage from 'figma:asset/e07e13a2f3760fdde8be911bb7c14c56f85b7c2a.png';
import { getSmartAIResponse, streamResponse, ProjectInfo } from '../utils/aiResponses';
import { useProject } from '../contexts/ProjectContext';

function IconClose() {
  return (
    <svg className="block size-[9.33px]" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 9.33333">
      <path d={svgPaths.p2dc32500} fill="currentColor" />
    </svg>
  );
}

const suggestedActions = [
  'Create a procedure',
  'Modify a procedure',
  'Organize project',
  'Inspect machine',
];

interface ActionDetails {
  type: 'created' | 'modified' | 'deleted' | 'organized';
  itemName: string;
  itemPath?: string;
  itemType: 'procedure' | 'folder' | 'digital-twin' | 'media' | 'workspace';
  icon?: 'file' | 'folder' | 'wrench' | 'sparkles';
  description?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  attachments?: Array<{name: string, size: number, preview?: string}>;
  error?: boolean;
  errorDetails?: string;
  id: string;
  feedback?: 'positive' | 'negative' | null;
  action?: ActionDetails;
  reverted?: boolean;
}

interface AIChatViewProps {
  onClose: () => void;
  currentPage?: string;
  currentProjectName?: string;
  currentItemName?: string;
  currentItemType?: 'folder' | 'procedure' | 'digital-twin' | 'media';
  isAdmin?: boolean;
  onNavigateToAiStudio?: () => void;
}

interface ContextSource {
  id: string;
  name: string;
  type: 'workspace' | 'project' | 'folder' | 'item' | 'knowledge-source';
  icon?: string;
}

// Mock context sources
const mockContextSources: ContextSource[] = [
  { id: 'all', name: 'All Sources', type: 'workspace' },
  { id: 'workspace', name: 'Workspace Level', type: 'workspace' },
  { id: 'project-1', name: 'Manufacturing Facility Alpha', type: 'project' },
  { id: 'folder-1', name: 'Manufacturing Equipment', type: 'folder' },
  { id: 'folder-2', name: 'Safety Protocols', type: 'folder' },
  { id: 'item-1', name: 'Maintenance Procedure - X500', type: 'item' },
  { id: 'item-2', name: 'CNC Machine Model X500', type: 'item' },
  { id: 'ks-1', name: 'Knowledge Sources', type: 'knowledge-source' },
];

// AI Response templates based on query type and context
const getAIResponse = (userMessage: string, context: ContextSource, stage?: number, projects?: ProjectInfo[]): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Machine inspection conversation flow
  if ((lowerMessage.includes('shut down') || lowerMessage.includes('shutdown')) && lowerMessage.includes('generator') && stage === 1) {
    return `I can see you're near the generator's power switch. Before shutting down the generator, it's important to follow the proper procedure:\n\n**Pre-Shutdown Steps:**\n1. **Reduce the load** - Disconnect or turn off all equipment connected to the generator\n2. **Let it cool down** - Allow the generator to run at idle (no load) for 3-5 minutes\n3. **Check the fuel valve** - Make sure you know where it is for the final step\n\n**Then you can proceed with:**\n4. Turn the switch to OFF position (the red button you're pointing at)\n5. Turn off the fuel valve\n\nHave you disconnected all equipment from the generator?`;
  }
  
  if ((lowerMessage.includes('yes') || lowerMessage.includes('disconnected')) && stage === 2) {
    return `Great! Now before turning off the power switch:\n\n✓ Equipment disconnected\n⏱️ **Let the generator run at idle for 3-5 minutes**\n\nThis cooling period is crucial because:\n• It prevents thermal shock to the engine\n• Allows the cooling system to dissipate heat properly\n• Extends the generator's lifespan\n\nOnce the cooling period is complete, you can turn the switch to OFF. Let me know when you're ready!`;
  }
  
  if ((lowerMessage.includes('ready') || lowerMessage.includes('done') || lowerMessage.includes('cooled')) && stage === 3) {
    return `Perfect! Now you can safely shut down the generator:\n\n**Final Steps:**\n1. ✅ Turn the power switch to **OFF** (the red button in your image)\n2. ⛽ **Turn off the fuel valve** - This prevents fuel from leaking and ensures safety\n3. 🔒 Wait for the engine to come to a complete stop\n\nThe generator is now safely shut down! Remember to:\n• Check for any unusual sounds or smells during shutdown\n• Note the hour meter reading if maintenance tracking is needed\n• Ensure the area is ventilated before leaving\n\nIs there anything else you need help with?`;
  }
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI assistant for Frontline360${context.type !== 'workspace' ? ` focused on "${context.name}"` : ''}. I can help you with:\n• Creating and modifying procedures\n• Organizing your projects\n• Finding content in your knowledge base\n• Answering questions about your workspace\n\nWhat would you like to do today?`;
  }
  
  // Create procedure
  if (lowerMessage.includes('create') && (lowerMessage.includes('procedure') || lowerMessage.includes('workflow'))) {
    return `I can help you create a new flow${context.type === 'folder' ? ` in "${context.name}"` : ''}! To get started:\n\n1. Go to the Knowledge Base page\n2. Click "New Flow" in the top right\n3. Enter a name and description\n4. Add steps using the flow editor\n\nWould you like me to guide you through creating a specific type of flow?`;
  }
  
  // Modify procedure
  if (lowerMessage.includes('modify') || lowerMessage.includes('edit')) {
    if (context.type === 'item' && context.name.includes('Procedure')) {
      return `To modify "${context.name}":\n\n1. Click the three-dot menu on this procedure\n2. Select "Edit"\n3. Make your changes in the procedure editor\n4. Click "Publish" to save your changes\n\nWhat changes would you like to make?`;
    }
    return `To modify an existing procedure:\n\n1. Navigate to the Knowledge Base\n2. Find the procedure you want to edit\n3. Click the three-dot menu and select "Edit"\n4. Make your changes in the procedure editor\n5. Click "Publish" to save\n\nWhich procedure would you like to modify?`;
  }
  
  // Organize project
  if (lowerMessage.includes('organize') || lowerMessage.includes('project')) {
    if (context.type === 'project') {
      return `I can help you organize "${context.name}"! Here are some tips:\n\n• Use folders to group related procedures\n• Apply consistent naming conventions\n• Use tags and categories for better searchability\n• Archive old or unused procedures\n\nWhat specific aspect would you like to organize?`;
    }
    return `I can help you organize your projects! Here are some tips:\n\n• Use folders to group related procedures\n• Apply consistent naming conventions\n• Use tags and categories for better searchability\n• Archive old or unused procedures\n\nWhat specific aspect of your project would you like to organize?`;
  }
  
  // Knowledge base questions
  if (lowerMessage.includes('knowledge') || lowerMessage.includes('document') || lowerMessage.includes('file')) {
    return `I can help you with your knowledge base${context.type === 'knowledge-source' ? ' sources' : ''}! You can:\n\n• Upload new files and documents\n• Search for existing content\n• Enable/disable knowledge sources\n• Set roles and permissions\n• Expose files to users\n\nGo to the AI Studio page to manage your knowledge sources. What would you like to know?`;
  }
  
  // Context-specific help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    let contextInfo = '';
    if (context.type === 'project') {
      contextInfo = `\n\n**Current Context:** ${context.name}\nI'm focused on this project and can help with project-specific tasks.`;
    } else if (context.type === 'folder') {
      contextInfo = `\n\n**Current Context:** ${context.name} folder\nI'm focused on this folder and its contents.`;
    } else if (context.type === 'item') {
      contextInfo = `\n\n**Current Context:** ${context.name}\nI'm focused on this specific item.`;
    }
    
    return `I can assist you with:\n• Creating procedures and workflows\n• Finding and organizing content\n• Managing your knowledge base\n• Answering questions about your workspace${contextInfo}`;
  }
  
  // Fall through to shared smart response engine
  return getSmartAIResponse(userMessage, projects);
};

/** Render markdown: **bold**, URLs, bullets, numbered lists, checkboxes, table rows */
const renderMessageContent = (text: string) => {
  const processInline = (str: string, keyPrefix: string = '') => {
    // Split by bold and URLs
    const parts = str.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyPrefix}-${j}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.match(/^https?:\/\//)) {
        return <a key={`${keyPrefix}-${j}`} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: 'var(--primary)' }}>{part}</a>;
      }
      return part;
    });
  };

  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.match(/^☐ /)) return <div key={i} style={{ paddingLeft: '4px' }}>{'☐ '}{processInline(line.slice(2), String(i))}</div>;
    if (line.match(/^[•\-] /)) return <div key={i} style={{ paddingLeft: '12px', textIndent: '-12px' }}>{processInline(line, String(i))}</div>;
    if (line.match(/^\d+\.\s/)) return <div key={i} style={{ paddingLeft: '8px' }}>{processInline(line, String(i))}</div>;
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.match(/^\|[\s-|]+\|$/)) return null;
      return <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{processInline(line, String(i))}</div>;
    }
    if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />;
    return <div key={i}>{processInline(line, String(i))}</div>;
  });
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function AIChatView({ 
  onClose, 
  currentPage = 'home',
  currentProjectName = 'Manufacturing Facility Alpha',
  currentItemName,
  currentItemType,
  isAdmin = false,
  onNavigateToAiStudio
}: AIChatViewProps) {
  const isMobile = useIsMobile();
  const { projects: rawProjects } = useProject();
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Convert project data for the AI engine
  const projectInfos: ProjectInfo[] = rawProjects.map(p => ({
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
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string, size: number, preview?: string}>>([]);
  const [fileUploadError, setFileUploadError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextSearch, setContextSearch] = useState('');
  const [selectedContext, setSelectedContext] = useState<ContextSource>(mockContextSources[0]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState('chat-1');
  const [selectedModel, setSelectedModel] = useState('frontline-ai');
  const [chatHistoryList, setChatHistoryList] = useState<Array<{id: string, title: string, lastMessage: string, timestamp: Date}>>([
    { id: 'chat-1', title: 'Current Chat', lastMessage: 'Hello! I\'m your AI assistant...', timestamp: new Date() }
  ]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [expandedDebugMessageId, setExpandedDebugMessageId] = useState<string | null>(null);
  const [showContextChangeWarning, setShowContextChangeWarning] = useState(false);
  const [pendingContext, setPendingContext] = useState<ContextSource | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertingMessageId, setRevertingMessageId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);
  const [rateLimitMessageId, setRateLimitMessageId] = useState<string | null>(null);
  const [machineInspectionStage, setMachineInspectionStage] = useState<number>(0);
  const [showCameraMode, setShowCameraMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const debugMenuRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);
  
  const MAX_CHAR_LIMIT = 4000;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Load draft message from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('chat-draft');
    if (draft) {
      setChatMessage(draft);
    }
  }, []);

  // Cycle through thinking stages
  useEffect(() => {
    if (!isTyping) { setThinkingStage(0); return; }
    const timer = setInterval(() => {
      setThinkingStage(prev => (prev + 1) % 3);
    }, 1200);
    return () => clearInterval(timer);
  }, [isTyping]);

  // Save draft message to localStorage
  useEffect(() => {
    if (chatMessage) {
      localStorage.setItem('chat-draft', chatMessage);
    } else {
      localStorage.removeItem('chat-draft');
    }
  }, [chatMessage]);

  // Determine current context based on page/item
  useEffect(() => {
    if (currentItemName) {
      setSelectedContext({
        id: 'current-item',
        name: currentItemName,
        type: 'item'
      });
    } else if (currentPage === 'ai-studio') {
      setSelectedContext(mockContextSources.find(s => s.id === 'ks-1') || mockContextSources[0]);
    } else if (currentPage === 'overview' || currentPage === 'knowledge-base') {
      setSelectedContext(mockContextSources.find(s => s.id === 'project-1') || mockContextSources[0]);
    } else {
      setSelectedContext(mockContextSources.find(s => s.id === 'workspace') || mockContextSources[0]);
    }
  }, [currentPage, currentItemName]);

  // Set initial welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI assistant for Frontline360${selectedContext.type !== 'workspace' ? ` focused on "${selectedContext.name}"` : ''}. I can help you create procedures, organize projects, and answer questions about your workspace. What would you like to do today?`,
          timestamp: new Date(),
          id: 'msg-0',
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive (only if auto-scroll is enabled)
  useEffect(() => {
    if (isAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, isAutoScroll]);

  // Handle scroll to detect if user has scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isNearBottom);
      setIsAutoScroll(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [chatMessage]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setShowFileMenu(false);
      }
      if (debugMenuRef.current && !debugMenuRef.current.contains(event.target as Node)) {
        setShowDebugMenu(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setShowHeaderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown === null || rateLimitCountdown <= 0) return;

    const timer = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  // Update rate limit message content
  useEffect(() => {
    if (rateLimitMessageId && rateLimitCountdown !== null) {
      setChatMessages(prev => prev.map(msg => 
        msg.id === rateLimitMessageId 
          ? { 
              ...msg, 
              content: rateLimitCountdown > 0 
                ? `⚠️ Rate limit exceeded. Please wait ${rateLimitCountdown} second${rateLimitCountdown !== 1 ? 's' : ''} before sending another message.`
                : '⚠️ Rate limit period expired. You can now send messages again.'
            }
          : msg
      ));
    }
  }, [rateLimitCountdown, rateLimitMessageId]);

  const handleSuggestedAction = (action: string) => {
    if (action.toLowerCase() === 'inspect machine') {
      // Special handling for machine inspection
      setChatMessage('Inspect machine');
      // Focus and wait a bit before auto-sending
      setTimeout(() => {
        textareaRef.current?.focus();
        // Auto-send with image attachment after a brief delay
        setTimeout(() => {
          handleSendMachineInspectionMessage();
        }, 500);
      }, 0);
    } else {
      setChatMessage(action);
      // Focus the textarea after setting the message
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleSendMachineInspectionMessage = () => {
    const messageToSend = 'Can you help me safely shut down this generator? Are there any steps I should complete before turning it off?';
    setMachineInspectionStage(1);
    
    // Create the image attachment
    const imageAttachment = {
      name: 'generator-shutdown.png',
      size: 245680,
      preview: generatorImage
    };
    
    const msgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
      attachments: [imageAttachment],
      id: msgId,
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatMessage('');
    setAttachedFiles([]);
    setIsTyping(true);
    
    // AI responds after a delay
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = getAIResponse(messageToSend, selectedContext, 1, projectInfos);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          id: `msg-${Date.now()}`,
        },
      ]);
      setMachineInspectionStage(2);
    }, 1200);
  };

  const handleCameraCapture = () => {
    // Close camera mode
    setShowCameraMode(false);
    
    // Send the machine inspection message with image
    handleSendMachineInspectionMessage();
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          setFileUploadError(`File "${file.name}" is too large. Max size is ${formatFileSize(MAX_FILE_SIZE)}`);
          return null;
        }

        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        return {
          name: file.name,
          size: file.size,
          preview
        };
      }).filter(f => f !== null) as Array<{name: string, size: number, preview?: string}>;

      setAttachedFiles(prev => [...prev, ...newFiles]);
      setFileUploadError('');
      setShowFileMenu(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setChatHistoryList(prev => [
      { id: newChatId, title: 'New Chat', lastMessage: '', timestamp: new Date() },
      ...prev
    ]);
    setCurrentChatId(newChatId);
    setChatMessages([{
      role: 'assistant',
      content: `Hello! I'm your AI assistant for Frontline360. What would you like to do today?`,
      timestamp: new Date(),
      id: `msg-${Date.now()}-0`,
    }]);
    setMachineInspectionStage(0);
  };

  const handleSwitchChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // In a real app, this would load chat history from storage
    setChatMessages([{
      role: 'assistant',
      content: `Switched to ${chatHistoryList.find(c => c.id === chatId)?.title}`,
      timestamp: new Date(),
      id: `msg-${Date.now()}-0`,
    }]);
    setMachineInspectionStage(0);
  };

  const handleMediaLibrarySelect = (files: string[]) => {
    const newFiles = files.map(f => ({
      name: f,
      size: 0,
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
    setShowMediaLibrary(false);
  };

  const handleSendMessage = (messageOverride?: string) => {
    const messageToSend = messageOverride || chatMessage.trim();
    
    if (!messageToSend && attachedFiles.length === 0) {
      return; // Don't send empty messages
    }

    const msgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      role: 'user',
      content: messageToSend || '[File attachments only]',
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      id: msgId,
    };
    
    setChatMessages([...chatMessages, userMsg]);
    setChatMessage('');
    setAttachedFiles([]);
    setFileUploadError('');
    setIsTyping(true);
    
    // Update chat history with last message
    setChatHistoryList(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, lastMessage: messageToSend, timestamp: new Date() }
        : chat
    ));
    
    // Cancel any in-progress stream
    cancelStreamRef.current?.();

    // Simulate AI thinking, then stream response
    const thinkingTime = 600 + Math.random() * 800;
    const aiMsgId = `msg-${Date.now()}-ai`;
    const fullResponse = getAIResponse(userMsg.content, selectedContext, machineInspectionStage, projectInfos);

    const thinkTimer = setTimeout(() => {
      setIsTyping(false);
      // Add empty assistant message to stream into
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', timestamp: new Date(), id: aiMsgId },
      ]);

      cancelStreamRef.current = streamResponse(
        fullResponse,
        (partial) => {
          setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: partial } : m));
        },
        () => {
          cancelStreamRef.current = null;
          // Advance machine inspection stage if applicable
          if (machineInspectionStage > 0 && machineInspectionStage < 4) {
            setMachineInspectionStage(machineInspectionStage + 1);
          }
        },
      );
    }, thinkingTime);

    cancelStreamRef.current = () => {
      clearTimeout(thinkTimer);
    };
  };

  const handleRetryMessage = (messageId: string) => {
    // Find the failed message
    const failedMsg = chatMessages.find(m => m.id === messageId);
    if (!failedMsg) return;

    // Remove the failed message
    setChatMessages(prev => prev.filter(m => m.id !== messageId));

    // Retry sending
    setTimeout(() => {
      const msgId = `msg-${Date.now()}`;
      const retryMsg: ChatMessage = {
        ...failedMsg,
        id: msgId,
        error: false,
      };
      
      setChatMessages(prev => [...prev, retryMsg]);
      setIsTyping(true);

      const retryAiId = `msg-${Date.now()}-ai`;
      const retryResponse = getAIResponse(retryMsg.content, selectedContext, machineInspectionStage, projectInfos);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date(), id: retryAiId }]);
        streamResponse(
          retryResponse,
          (partial) => { setChatMessages(prev => prev.map(m => m.id === retryAiId ? { ...m, content: partial } : m)); },
          () => {},
        );
      }, 1000);
    }, 300);
  };

  const handleContextSelect = (context: ContextSource) => {
    // Check if there are user messages in the chat
    const hasUserMessages = chatMessages.filter(m => m.role === 'user').length > 0;
    
    if (hasUserMessages && context.id !== selectedContext.id) {
      // Show warning
      setPendingContext(context);
      setShowContextChangeWarning(true);
      setShowContextMenu(false);
    } else {
      applyContextChange(context);
    }
  };

  const applyContextChange = (context: ContextSource) => {
    setSelectedContext(context);
    setShowContextMenu(false);
    setContextSearch('');
    
    // Add system message about context change
    setChatMessages((prev) => [
      ...prev,
      {
        role: 'system',
        content: `Context changed to: ${context.name}`,
        timestamp: new Date(),
        id: `msg-${Date.now()}`,
      }
    ]);
  };

  const confirmContextChange = () => {
    if (pendingContext) {
      applyContextChange(pendingContext);
    }
    setShowContextChangeWarning(false);
    setPendingContext(null);
  };

  const cancelContextChange = () => {
    setShowContextChangeWarning(false);
    setPendingContext(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getContextIcon = (type: string) => {
    switch (type) {
      case 'workspace':
        return '🏢';
      case 'project':
        return '📁';
      case 'folder':
        return '📂';
      case 'item':
        return '📄';
      case 'knowledge-source':
        return '📚';
      default:
        return '📋';
    }
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
        : msg
    ));
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingMessageText(content);
  };

  const handleSaveEdit = (messageId: string) => {
    if (!editingMessageText.trim()) return;
    
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: editingMessageText }
        : msg
    ));
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleRevertAction = (messageId: string) => {
    setRevertingMessageId(messageId);
    setShowRevertModal(true);
  };

  const confirmRevert = () => {
    if (!revertingMessageId) return;
    
    // Mark message as reverted
    setChatMessages(prev => prev.map(msg => 
      msg.id === revertingMessageId 
        ? { ...msg, reverted: true }
        : msg
    ));

    setShowRevertModal(false);
    setRevertingMessageId(null);
  };

  const cancelRevert = () => {
    setShowRevertModal(false);
    setRevertingMessageId(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAutoScroll(true);
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // In real implementation, process the audio
      setChatMessage(prev => prev + ' [Voice message recorded]');
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        // In real implementation, start audio recording
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Microphone access is required for voice recording.');
      }
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  // Debug menu functions
  const simulateNetworkError = () => {
    const msgId = `msg-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: 'Test message that will fail',
        timestamp: new Date(),
        id: msgId,
        error: true,
        errorDetails: JSON.stringify({
          errorType: 'NetworkError',
          statusCode: 500,
          message: 'Internal Server Error',
          endpoint: '/api/chat',
          timestamp: new Date().toISOString(),
          requestId: `req-${Math.random().toString(36).substring(7)}`,
          stack: 'at handleSendMessage (AIChatView.tsx:406)\nat onClick (AIChatView.tsx:1467)'
        }, null, 2)
      }
    ]);
    setShowHeaderMenu(false);
  };

  const simulateLongResponse = () => {
    setChatMessage('Tell me everything about manufacturing');
    handleSendMessage('Tell me everything about manufacturing');
    setShowHeaderMenu(false);
  };

  const simulateRateLimit = () => {
    const msgId = `msg-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: '⚠️ Rate limit exceeded. Please wait 60 seconds before sending another message.',
        timestamp: new Date(),
        id: msgId,
      }
    ]);
    setRateLimitCountdown(60);
    setRateLimitMessageId(msgId);
    setShowHeaderMenu(false);
  };

  const simulateCodeBlock = () => {
    const msgId = `msg-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `Here's a sample code snippet:\n\nfunction createProcedure() {\n  return {\n    name: "Safety Check",\n    steps: ["Step 1", "Step 2"],\n    status: "active"\n  };\n}\n\nYou can use this pattern in your workflow.`,
        timestamp: new Date(),
        id: msgId,
      }
    ]);
    setShowHeaderMenu(false);
  };

  const simulateLinksInMessage = () => {
    const msgId = `msg-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `Check out these resources:\n\n• Documentation: https://frontline.io/docs\n• Support: https://support.frontline.io\n• Community: https://community.frontline.io\n\nLet me know if you need help with anything!`,
        timestamp: new Date(),
        id: msgId,
      }
    ]);
    setShowHeaderMenu(false);
  };

  const clearAllMessages = () => {
    setChatMessages([{
      role: 'assistant',
      content: `Hello! I'm your AI assistant for Frontline360. What would you like to do today?`,
      timestamp: new Date(),
      id: `msg-${Date.now()}-0`,
    }]);
    setMachineInspectionStage(0);
    setShowHeaderMenu(false);
  };

  const simulateActionMessage = () => {
    const userMsgId = `msg-${Date.now()}`;
    const aiMsgId = `msg-${Date.now() + 1}`;
    
    setChatMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: 'hey can you create a procedure with these steps:\n1. open door\n2. close door',
        timestamp: new Date(),
        id: userMsgId,
      },
      {
        role: 'assistant',
        content: 'I created a procedure with the steps you provided.',
        timestamp: new Date(),
        id: aiMsgId,
        action: {
          type: 'created',
          itemName: 'Door Operation Procedure',
          itemPath: 'Ilsyanay > AI Project > Door Operation Procedure',
          itemType: 'procedure',
          icon: 'file',
        }
      }
    ]);
    setShowHeaderMenu(false);
  };

  const filteredContextSources = mockContextSources.filter(source =>
    source.name.toLowerCase().includes(contextSearch.toLowerCase())
  );

  const isMessageEmpty = !chatMessage.trim() && attachedFiles.length === 0;
  const charCount = chatMessage.length;
  const showCharLimit = charCount > MAX_CHAR_LIMIT * 0.8;

  return (
    <div className="w-full h-full flex flex-col p-[8px]">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileSelect}
        accept={isMobile ? "image/*,video/*,.pdf,.doc,.docx" : undefined}
        capture={isMobile ? "environment" : undefined}
      />

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibraryModal
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleMediaLibrarySelect}
          isMobile={isMobile}
        />
      )}

      {/* Camera Mode */}
      {showCameraMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          {/* Camera Feed (using generator image) */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={generatorImage} 
              alt="Camera feed" 
              className="w-full h-full object-cover"
            />
            
            {/* Camera UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between pointer-events-auto" style={{ padding: 'var(--spacing-4)' }}>
                <button
                  onClick={() => setShowCameraMode(false)}
                  className="w-[40px] h-[40px] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <X size={20} color="white" />
                </button>
                
                <div className="flex items-center rounded-full" style={{ 
                  gap: 'var(--spacing-2)', 
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <div className="w-[8px] h-[8px] rounded-full animate-pulse" style={{ backgroundColor: '#ef4444' }} />
                  <span 
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'white'
                    }}
                  >
                    Camera
                  </span>
                </div>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  />
                ))}
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pointer-events-auto" style={{ padding: 'var(--spacing-6)' }}>
                <div className="flex items-center" style={{ gap: 'var(--spacing-8)' }}>
                  {/* Gallery Button (placeholder) */}
                  <div className="w-[48px] h-[48px]" style={{ 
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }} />
                  
                  {/* Capture Button */}
                  <button
                    onClick={handleCameraCapture}
                    className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center relative hover:scale-105 transition-transform"
                    style={{ border: '4px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    <div className="w-[56px] h-[56px] rounded-full bg-white" style={{ border: '4px solid rgba(0, 0, 0, 0.1)' }} />
                  </button>
                  
                  {/* Flip Camera Button (placeholder) */}
                  <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <RotateCcw size={20} color="white" />
                  </div>
                </div>
              </div>

              {/* Exposure/Focus Indicator */}
              <div className="absolute top-1/2 left-1/2 w-[120px] h-[120px] rounded-lg pointer-events-none" style={{ 
                transform: 'translate(-50%, -50%)',
                border: '2px solid rgba(255, 255, 255, 0.5)'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Context Change Warning Modal */}
      {showContextChangeWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={cancelContextChange} />
          
          {/* Modal */}
          <div
            className="relative bg-card border border-border rounded-[var(--radius)] p-[24px] max-w-[400px] mx-[16px]"
            style={{
              boxShadow: 'var(--elevation-lg)',
            }}
          >
            <div className="flex items-start gap-[12px] mb-[16px]">
              <AlertCircle size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div>
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)',
                    marginBottom: '8px',
                  }}
                >
                  Change Context?
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted)',
                    lineHeight: '1.5',
                  }}
                >
                  You have an active conversation. Changing context to "{pendingContext?.name}" may affect the AI's responses.
                </p>
              </div>
            </div>

            <div className="flex gap-[8px] justify-end">
              <button
                onClick={cancelContextChange}
                className="px-[16px] py-[8px] rounded-[var(--radius)] hover:bg-secondary transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmContextChange}
                className="px-[16px] py-[8px] rounded-[var(--radius)] bg-primary hover:opacity-90 transition-opacity"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--primary-foreground)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Change Context
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revert Action Confirmation Modal */}
      {showRevertModal && revertingMessageId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={cancelRevert} />
          
          {/* Modal */}
          <div
            className="relative bg-card border border-border rounded-[var(--radius)] p-[24px] max-w-[400px] mx-[16px]"
            style={{
              boxShadow: 'var(--elevation-lg)',
            }}
          >
            <div className="flex items-start gap-[12px] mb-[16px]">
              <Undo2 size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div>
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)',
                    marginBottom: '8px',
                  }}
                >
                  Revert Action?
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted)',
                    lineHeight: '1.5',
                  }}
                >
                  This will undo the changes made by the AI. The {chatMessages.find(m => m.id === revertingMessageId)?.action?.itemType || 'item'} "{chatMessages.find(m => m.id === revertingMessageId)?.action?.itemName}" will be reverted to its previous state.
                </p>
              </div>
            </div>

            <div className="flex gap-[8px] justify-end">
              <button
                onClick={cancelRevert}
                className="px-[16px] py-[8px] rounded-[var(--radius)] hover:bg-secondary transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRevert}
                className="px-[16px] py-[8px] rounded-[var(--radius)] bg-warning hover:opacity-90 transition-opacity"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Revert Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Card */}
      <div className="bg-card border border-border rounded-[var(--radius)] flex flex-1 overflow-hidden shadow-elevation-sm">
        {/* Chat History Sidebar */}
        {showChatHistory && (
          <div
            className="w-[250px] border-r border-border flex flex-col bg-card shrink-0"
            style={{
              animation: 'slideInFromLeft 0.2s ease-out',
            }}
          >
            {/* Chat List Header */}
            <div className="px-[12px] py-[12px] border-b border-border shrink-0">
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--foreground)',
                }}
              >
                Chat History
              </span>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-[8px] py-[8px]">
              <div className="space-y-[2px]">
                {chatHistoryList.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSwitchChat(chat.id)}
                    className={`w-full text-left px-[12px] py-[8px] rounded-[var(--radius)] transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-primary/10'
                        : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="truncate">
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: currentChatId === chat.id ? 'var(--font-weight-bold)' : 'normal',
                          color: currentChatId === chat.id ? 'var(--primary)' : 'var(--foreground)',
                        }}
                      >
                        {chat.title}
                      </span>
                    </div>
                    <p
                      className="truncate"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--muted)',
                      }}
                    >
                      {chat.lastMessage}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div
            className="flex items-center justify-between px-[16px] py-[12px] border-b border-border shrink-0"
            style={{
              fontFamily: 'var(--font-family)',
            }}
          >
            <div className="flex items-center gap-[8px]">
              {/* Toggle Chat History Button */}
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className="p-[6px] hover:bg-secondary rounded-[var(--radius)] transition-colors"
                title={showChatHistory ? "Hide Chat History" : "Show Chat History"}
              >
                <History size={20} style={{ color: 'var(--foreground)' }} />
              </button>

              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="p-[8px] rounded-[var(--radius)] border border-border hover:bg-secondary transition-colors flex items-center justify-center"
                title="New Chat"
              >
                <Plus size={20} style={{ color: 'var(--foreground)' }} />
              </button>

              {/* Model Selector */}
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                compact={true}
              />
            </div>

            <div className="flex items-center gap-[8px]">
              {/* Header Menu (Three Dots) */}
              <div className="relative" ref={headerMenuRef}>
                <button
                  onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                  className="p-[6px] hover:bg-secondary rounded-[var(--radius)] transition-colors"
                  title="More Options"
                >
                  <MoreVertical size={18} style={{ color: 'var(--muted)' }} />
                </button>

                {/* Header Menu Dropdown */}
                {showHeaderMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowHeaderMenu(false)}
                    />
                    <div
                      className="absolute right-0 top-[calc(100%+4px)] z-50 bg-card border border-border rounded-[var(--radius)] overflow-hidden"
                      style={{
                        width: '220px',
                        boxShadow: 'var(--elevation-md)',
                      }}
                    >
                      <div className="py-[4px]">
                        {/* Customize Option (Admin Only) */}
                        {isAdmin && onNavigateToAiStudio && (
                          <>
                            <button
                              onClick={() => {
                                onNavigateToAiStudio();
                                setShowHeaderMenu(false);
                              }}
                              className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                            >
                              <div className="flex items-center gap-[8px]">
                                <Settings2 size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)', fontWeight: 'var(--font-weight-bold)' }}>
                                  Customize
                                </span>
                              </div>
                            </button>
                            <div className="my-[4px] border-t border-border" />
                          </>
                        )}

                        {/* Debug Submenu */}
                        <div
                          className="px-[12px] py-[6px]"
                          style={{
                            backgroundColor: 'var(--secondary)',
                          }}
                        >
                          <div className="flex items-center gap-[6px]">
                            <Bug size={14} style={{ color: 'var(--muted)' }} />
                            <span
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Debug
                            </span>
                          </div>
                        </div>
                      
                      <div className="py-[2px]">
                        <button
                          onClick={simulateNetworkError}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <AlertCircle size={14} style={{ color: 'var(--error)' }} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                              Simulate Network Error
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={simulateRateLimit}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <Clock size={14} style={{ color: 'var(--warning)' }} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                              Simulate Rate Limit
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={simulateLongResponse}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                              Long Response
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={simulateCodeBlock}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <span style={{ fontSize: '14px' }}>{'{ }'}</span>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                              Message with Code
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={simulateLinksInMessage}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <span style={{ fontSize: '14px' }}>🔗</span>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                              Message with Links
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={simulateActionMessage}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                              Action Message
                            </span>
                          </div>
                        </button>

                        <div className="my-[4px] border-t border-border" />

                        <button
                          onClick={clearAllMessages}
                          className="w-full px-[12px] py-[8px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="flex items-center gap-[8px]">
                            <Trash2 size={14} style={{ color: 'var(--error)' }} />
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>
                              Clear All Messages
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-[6px] hover:bg-secondary rounded-[var(--radius)] transition-colors"
              >
                <IconClose />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-[16px] min-h-0 relative">
            {/* Suggested Actions (only show if no user messages yet) */}
            {chatMessages.filter(m => m.role === 'user').length === 0 && (
              <div className="flex flex-wrap gap-[8px] mb-[16px]">
                {suggestedActions.map((action, index) => (
                  <button
                    key={index}
                    className="px-[12px] py-[8px] bg-card border-[2px] border-primary text-primary rounded-[var(--radius-button)] hover:bg-primary/5 transition-colors"
                    style={{
                      fontSize: 'var(--text-sm)',
                    }}
                    onClick={() => handleSuggestedAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

          {/* Chat Messages */}
          <div className="space-y-[16px]">
            {chatMessages.map((msg) => (
              <div key={msg.id}>
                {msg.role === 'system' ? (
                  <div className="flex justify-center">
                    <div
                      className="px-[12px] py-[6px] rounded-[var(--radius)] bg-secondary/30 max-w-[80%]"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--muted)',
                        textAlign: 'center',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="flex flex-col max-w-[85%] relative" style={{ paddingBottom: !msg.error && editingMessageId !== msg.id ? '26px' : '0' }}>
                      <div
                        className={`rounded-[var(--radius)] px-[14px] py-[12px] ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : msg.error
                            ? 'bg-error/10 border border-error'
                            : 'bg-secondary/50'
                        }`}
                      >
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-[8px] flex flex-wrap gap-[6px]">
                            {msg.attachments.map((file, fileIdx) => (
                              <div
                                key={fileIdx}
                                className="px-[8px] py-[4px] rounded-[var(--radius)] bg-background border border-border flex items-center gap-[6px]"
                              >
                                {file.preview ? (
                                  <img src={file.preview} alt="" className="w-[40px] h-[40px] object-cover rounded" />
                                ) : (
                                  <Paperclip size={12} style={{ color: 'var(--muted)' }} />
                                )}
                                <div>
                                  <span
                                    style={{
                                      fontSize: 'var(--text-sm)',
                                      color: 'var(--foreground)',
                                    }}
                                  >
                                    {file.name}
                                  </span>
                                  {file.size > 0 && (
                                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                      {formatFileSize(file.size)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Text */}
                        {editingMessageId === msg.id && msg.role === 'user' ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family)',
                                minHeight: '80px',
                              }}
                              autoFocus
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-[var(--radius)] border border-border hover:bg-secondary transition-colors text-xs"
                                style={{
                                  color: 'var(--foreground)',
                                  fontWeight: 'var(--font-weight-medium)',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3 py-1.5 rounded-[var(--radius)] bg-primary hover:opacity-90 transition-opacity text-xs flex items-center gap-1.5"
                                style={{
                                  color: 'var(--primary-foreground)',
                                  fontWeight: 'var(--font-weight-bold)',
                                }}
                              >
                                <Save size={12} />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            style={{
                              fontSize: 'var(--text-sm)',
                              color: msg.role === 'user' ? 'var(--primary-foreground)' : msg.error ? 'var(--error)' : 'var(--foreground)',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.5',
                            }}
                          >
                            {renderMessageContent(msg.content)}
                          </p>
                        )}

                        {/* Action Card */}
                        {msg.action && !msg.reverted && (
                          <div 
                            className="mt-[12px] rounded-[var(--radius)] border border-border bg-background/50 overflow-hidden"
                            style={{
                              boxShadow: 'var(--elevation-xs)',
                            }}
                          >
                            {/* Action Header */}
                            <div 
                              className="px-[12px] py-[8px] flex items-center gap-[8px]"
                              style={{
                                backgroundColor: msg.action.type === 'created' 
                                  ? 'var(--success-light, rgba(34, 197, 94, 0.1))'
                                  : msg.action.type === 'modified'
                                  ? 'var(--primary-light, rgba(59, 130, 246, 0.1))'
                                  : msg.action.type === 'deleted'
                                  ? 'var(--error-light, rgba(239, 68, 68, 0.1))'
                                  : 'var(--secondary)',
                              }}
                            >
                              {msg.action.icon === 'file' ? (
                                <FileText size={16} style={{ 
                                  color: msg.action.type === 'created' 
                                    ? 'var(--success)' 
                                    : msg.action.type === 'modified' 
                                    ? 'var(--primary)' 
                                    : 'var(--foreground)' 
                                }} />
                              ) : msg.action.icon === 'folder' ? (
                                <Folder size={16} style={{ color: 'var(--warning)' }} />
                              ) : msg.action.icon === 'wrench' ? (
                                <Wrench size={16} style={{ color: 'var(--primary)' }} />
                              ) : (
                                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                              )}
                              <span
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-bold)',
                                  color: msg.action.type === 'created' 
                                    ? 'var(--success)' 
                                    : msg.action.type === 'modified' 
                                    ? 'var(--primary)' 
                                    : msg.action.type === 'deleted'
                                    ? 'var(--error)'
                                    : 'var(--foreground)',
                                }}
                              >
                                {msg.action.type === 'created' && 'Created'}
                                {msg.action.type === 'modified' && 'Modified'}
                                {msg.action.type === 'deleted' && 'Deleted'}
                                {msg.action.type === 'organized' && 'Organized'}
                              </span>
                            </div>

                            {/* Action Content */}
                            <div className="px-[12px] py-[10px]">
                              <div className="flex items-start justify-between gap-[8px]">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="truncate"
                                    style={{
                                      fontSize: 'var(--text-sm)',
                                      fontWeight: 'var(--font-weight-bold)',
                                      color: 'var(--foreground)',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {msg.action.itemName}
                                  </p>
                                  {msg.action.itemPath && (
                                    <p
                                      className="truncate"
                                      style={{
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--muted)',
                                      }}
                                    >
                                      {msg.action.itemPath}
                                    </p>
                                  )}
                                  {msg.action.description && (
                                    <p
                                      style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--muted)',
                                        marginTop: '6px',
                                      }}
                                    >
                                      {msg.action.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reverted Indicator */}
                        {msg.reverted && msg.action && (
                          <div className="mt-[12px] px-[12px] py-[8px] rounded-[var(--radius)] bg-muted/20 border border-muted flex items-center gap-[8px]">
                            <Undo2 size={14} style={{ color: 'var(--muted)' }} />
                            <span
                              style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--muted)',
                                fontStyle: 'italic',
                              }}
                            >
                              Action reverted
                            </span>
                          </div>
                        )}

                        {/* Error indicator */}
                        {msg.error && (
                          <div className="mt-[8px]">
                            <div className="flex items-center gap-[6px]">
                              <AlertCircle size={14} style={{ color: 'var(--error)' }} />
                              <span style={{ fontSize: '11px', color: 'var(--error)' }}>
                                Failed to send
                              </span>
                              {msg.errorDetails && (
                                <button
                                  onClick={() => setExpandedDebugMessageId(
                                    expandedDebugMessageId === msg.id ? null : msg.id
                                  )}
                                  className="p-[2px] hover:bg-error/10 rounded transition-colors"
                                  title={expandedDebugMessageId === msg.id ? "Hide debug info" : "Show debug info"}
                                >
                                  <Bug size={12} style={{ color: 'var(--error)' }} />
                                </button>
                              )}
                            </div>
                            
                            {/* Debug Details */}
                            {msg.errorDetails && expandedDebugMessageId === msg.id && (
                              <div className="mt-[8px] bg-error/5 border border-error/20 rounded-[var(--radius)] p-[10px]">
                                <div className="flex items-center justify-between mb-[6px]">
                                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--error)' }}>
                                    Debug Information
                                  </span>
                                  <button
                                    onClick={() => handleCopyMessage(`${msg.id}-debug`, msg.errorDetails || '')}
                                    className="p-[2px] hover:bg-error/10 rounded transition-colors"
                                    title="Copy debug info"
                                  >
                                    {copiedMessageId === `${msg.id}-debug` ? (
                                      <Check size={12} style={{ color: 'var(--success)' }} />
                                    ) : (
                                      <Copy size={12} style={{ color: 'var(--error)' }} />
                                    )}
                                  </button>
                                </div>
                                <pre 
                                  style={{ 
                                    fontSize: 'var(--text-xs)', 
                                    color: 'var(--error)',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    lineHeight: '1.4'
                                  }}
                                >
                                  {msg.errorDetails}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Message Actions - Absolutely positioned */}
                      {!msg.error && editingMessageId !== msg.id && (
                        <div 
                          className="flex items-center gap-[4px] px-[4px] absolute bottom-0"
                          style={{
                            height: '26px',
                            opacity: hoveredMessageId === msg.id || (msg.role === 'assistant' && (msg.action && !msg.reverted)) ? 1 : 0,
                            pointerEvents: hoveredMessageId === msg.id || (msg.role === 'assistant' && (msg.action && !msg.reverted)) ? 'auto' : 'none',
                            transition: 'opacity 0.15s ease-in-out',
                            right: msg.role === 'user' ? '0' : 'auto',
                            left: msg.role === 'assistant' ? '0' : 'auto',
                          }}
                        >
                          {msg.role === 'assistant' ? (
                            msg.action && !msg.reverted ? (
                              <button
                                onClick={() => handleRevertAction(msg.id)}
                                className="px-[8px] py-[4px] rounded-[var(--radius)] border border-warning bg-warning/10 hover:bg-warning/20 transition-colors flex items-center gap-[4px]"
                                title="Revert this action"
                              >
                                <Undo2 size={14} style={{ color: 'var(--warning)' }} />
                                <span
                                  style={{
                                    fontSize: 'var(--text-xs)',
                                    fontWeight: 'var(--font-weight-bold)',
                                    color: 'var(--warning)',
                                  }}
                                >
                                  Revert
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="p-[4px] hover:bg-secondary rounded transition-colors"
                                title="Copy message"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check size={14} style={{ color: 'var(--success)' }} />
                                ) : (
                                  <Copy size={14} style={{ color: 'var(--muted)' }} />
                                )}
                              </button>
                            )
                          ) : (
                            <>
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="p-[4px] hover:bg-secondary rounded transition-colors"
                                title="Copy message"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check size={14} style={{ color: 'var(--success)' }} />
                                ) : (
                                  <Copy size={14} style={{ color: 'var(--muted)' }} />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditMessage(msg.id, msg.content)}
                                className="p-[4px] hover:bg-secondary rounded transition-colors"
                                title="Edit message"
                              >
                                <Edit2 size={14} style={{ color: 'var(--muted)' }} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Retry Button for Failed Messages */}
                      {msg.error && (
                        <button
                          onClick={() => handleRetryMessage(msg.id)}
                          className="mt-[4px] px-[12px] py-[6px] rounded-[var(--radius)] border border-error hover:bg-error/10 transition-colors flex items-center gap-[6px] self-end"
                        >
                          <RotateCcw size={14} style={{ color: 'var(--error)' }} />
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>
                            Retry
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-[var(--radius)] px-[14px] py-[12px] bg-secondary/50 max-w-[85%]">
                  <div className="flex items-center gap-[6px]">
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--muted)',
                      }}
                    >
                      {['Thinking...', 'Searching knowledge base...', 'Generating response...'][thinkingStage]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-[16px] right-[16px] p-[10px] rounded-full bg-primary shadow-elevation-md hover:opacity-90 transition-opacity"
                style={{
                  zIndex: 10,
                }}
              >
                <ArrowDown size={20} style={{ color: 'var(--primary-foreground)' }} />
              </button>
            )}
          </div>

          {/* Input Area */}
          <div className="px-[16px] py-[12px] border-t border-border bg-primary/5 shrink-0">
            {/* Context Button */}
            <div className="mb-[8px] relative" ref={contextMenuRef}>
              <button
                className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[var(--radius)] bg-primary/10 border border-primary hover:bg-primary/20 transition-colors w-full"
                onClick={() => setShowContextMenu(!showContextMenu)}
                style={{
                  fontSize: 'var(--text-sm)',
                }}
              >
                <span
                  style={{
                    color: 'var(--foreground)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Context:
                </span>
                <span style={{ color: 'var(--primary)' }}>
                  {getContextIcon(selectedContext.type)} {selectedContext.name}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--primary)', marginLeft: 'auto' }} />
              </button>

              {/* Context Menu */}
              {showContextMenu && (
                <>
                  {/* Backdrop */}
                  {isMobile && (
                    <div
                      className="fixed inset-0 z-40 bg-black/30"
                      onClick={() => setShowContextMenu(false)}
                    />
                  )}

                  <div
                  className={`${
                    isMobile
                      ? 'fixed bottom-0 left-0 right-0 rounded-t-[16px]'
                      : 'absolute bottom-full left-0 mb-[8px] w-full rounded-[var(--radius)]'
                  } bg-card border border-border shadow-elevation-lg z-50 overflow-hidden`}
                  style={{
                    maxHeight: isMobile ? '70vh' : '320px',
                    animation: isMobile ? 'slideUp 0.3s ease-out' : undefined,
                  }}
                >
                  {/* Mobile sheet handle */}
                  {isMobile && (
                    <div className="flex justify-center pt-[12px] pb-[8px]">
                      <div
                        className="w-[40px] h-[4px] rounded-full"
                        style={{ backgroundColor: 'var(--muted)' }}
                      />
                    </div>
                  )}

                  {/* Search */}
                  <div className="px-[12px] py-[10px] border-b border-border">
                    <div className="flex items-center gap-[8px] px-[10px] py-[6px] bg-secondary/30 rounded-[var(--radius)]">
                      <Search size={14} style={{ color: 'var(--muted)' }} />
                      <input
                        type="text"
                        placeholder="Search sources..."
                        value={contextSearch}
                        onChange={(e) => setContextSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--foreground)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Source List */}
                  <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: isMobile ? 'calc(70vh - 100px)' : '220px' }}>
                    {filteredContextSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => handleContextSelect(source)}
                        className={`w-full text-left px-[16px] py-[10px] hover:bg-secondary transition-colors flex items-center gap-[10px] ${
                          selectedContext.id === source.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="text-[16px]">{getContextIcon(source.type)}</span>
                        <span
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: selectedContext.id === source.id ? 'var(--primary)' : 'var(--foreground)',
                            fontWeight: selectedContext.id === source.id ? 'var(--font-weight-bold)' : 'normal',
                          }}
                        >
                          {source.name}
                        </span>
                        {selectedContext.id === source.id && (
                          <Check size={14} style={{ color: 'var(--primary)', marginLeft: 'auto' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                </>
              )}
            </div>

            {/* File Upload Error */}
            {fileUploadError && (
              <div className="mb-[8px] px-[12px] py-[8px] rounded-[var(--radius)] bg-error/10 border border-error flex items-center gap-[8px]">
                <AlertCircle size={14} style={{ color: 'var(--error)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>
                  {fileUploadError}
                </span>
                <button
                  onClick={() => setFileUploadError('')}
                  className="ml-auto p-[2px] hover:bg-error/20 rounded transition-colors"
                >
                  <X size={14} style={{ color: 'var(--error)' }} />
                </button>
              </div>
            )}

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-[8px] flex flex-wrap gap-[8px]">
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="px-[10px] py-[6px] rounded-[var(--radius)] bg-card border border-border flex items-center gap-[8px] relative group"
                  >
                    {file.preview ? (
                      <img src={file.preview} alt="" className="w-[40px] h-[40px] object-cover rounded" />
                    ) : (
                      <Paperclip size={14} style={{ color: 'var(--muted)' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--foreground)',
                          maxWidth: '150px',
                        }}
                      >
                        {file.name}
                      </p>
                      {file.size > 0 && (
                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {formatFileSize(file.size)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-[4px] hover:bg-error/10 rounded transition-colors"
                    >
                      <X size={12} style={{ color: 'var(--error)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Voice Recording Indicator */}
            {isRecording && (
              <div className="mb-[8px] px-[12px] py-[8px] rounded-[var(--radius)] bg-error/10 border border-error flex items-center gap-[8px]">
                <div className="flex items-center gap-[8px] flex-1">
                  <Mic size={16} style={{ color: 'var(--error)' }} className="animate-pulse" />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--error)', fontWeight: 'var(--font-weight-bold)' }}>
                    Recording...
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    {formatDuration(recordingDuration)}
                  </span>
                </div>
                <button
                  onClick={cancelRecording}
                  className="px-[12px] py-[6px] rounded-[var(--radius)] hover:bg-error/20 transition-colors flex items-center gap-[6px]"
                >
                  <X size={14} style={{ color: 'var(--error)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>
                    Cancel
                  </span>
                </button>
              </div>
            )}

            {/* Input Box */}
            <div className="bg-card border border-border rounded-[var(--radius)] p-[10px]">
              <div className="flex gap-[8px]">
                <textarea
                  ref={textareaRef}
                  placeholder="Write your instructions here..."
                  value={chatMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHAR_LIMIT) {
                      setChatMessage(e.target.value);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none resize-none custom-scrollbar"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                    minHeight: '50px',
                    maxHeight: '100px',
                    fontFamily: 'var(--font-family)',
                    alignSelf: 'flex-start',
                  }}
                  rows={2}
                />
                
                {/* Action Buttons - Horizontal Layout */}
                <div className="flex items-start gap-[6px]">
                  {/* File Attach Menu */}
                  <div className="relative" ref={fileMenuRef}>
                    <button
                      className="p-[8px] hover:bg-secondary rounded-[var(--radius)] transition-colors shrink-0"
                      onClick={() => setShowFileMenu(!showFileMenu)}
                      title="Attach files"
                    >
                      <Paperclip size={16} style={{ color: 'var(--foreground)' }} />
                    </button>

                    {showFileMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40 bg-black/30"
                          onClick={() => setShowFileMenu(false)}
                        />
                        
                        {/* Menu - Desktop dropdown or Mobile bottom sheet */}
                        <div
                        className={`${
                          isMobile
                            ? 'fixed bottom-0 left-0 right-0 rounded-t-[16px]'
                            : 'absolute bottom-full mb-[8px] left-0 rounded-[var(--radius)] min-w-[200px]'
                        } bg-card border border-border shadow-elevation-sm z-50 overflow-hidden`}
                        style={{
                          animation: isMobile ? 'slideUp 0.3s ease-out' : undefined,
                        }}
                      >
                        {/* Mobile sheet handle */}
                        {isMobile && (
                          <div className="flex justify-center pt-[12px] pb-[8px]">
                            <div
                              className="w-[40px] h-[4px] rounded-full"
                              style={{ backgroundColor: 'var(--muted)' }}
                            />
                          </div>
                        )}

                        <div className={isMobile ? 'pb-[24px]' : ''}>
                          <button
                            className="w-full px-[16px] py-[12px] hover:bg-secondary transition-colors flex items-center gap-[12px] text-left"
                            onClick={() => {
                              handleAttachFile();
                              setShowFileMenu(false);
                            }}
                          >
                            <Upload size={18} style={{ color: 'var(--foreground)' }} />
                            <div>
                              <div
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-bold)',
                                  color: 'var(--foreground)',
                                }}
                              >
                                Upload from Device
                              </div>
                              <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                Max {formatFileSize(MAX_FILE_SIZE)}
                              </p>
                            </div>
                          </button>

                          {isMobile && (
                            <button
                              className="w-full px-[16px] py-[12px] hover:bg-secondary transition-colors flex items-center gap-[12px] text-left"
                              onClick={() => {
                                setShowCameraMode(true);
                                setShowFileMenu(false);
                              }}
                            >
                              <Camera size={18} style={{ color: 'var(--foreground)' }} />
                              <div
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-bold)',
                                  color: 'var(--foreground)',
                                }}
                              >
                                Take Photo/Video
                              </div>
                            </button>
                          )}

                          <button
                            className="w-full px-[16px] py-[12px] hover:bg-secondary transition-colors flex items-center gap-[12px] text-left"
                            onClick={() => {
                              setShowMediaLibrary(true);
                              setShowFileMenu(false);
                            }}
                          >
                            <FolderOpen size={18} style={{ color: 'var(--foreground)' }} />
                            <div
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--foreground)',
                              }}
                            >
                              From Media Library
                            </div>
                          </button>
                        </div>
                      </div>
                      </>
                    )}
                  </div>

                  {/* Voice Recording Button */}
                  <button
                    className={`p-[8px] rounded-[var(--radius)] transition-colors shrink-0 ${
                      isRecording ? 'bg-error/10' : 'hover:bg-secondary'
                    }`}
                    onClick={handleVoiceRecording}
                    title={isRecording ? "Stop recording" : "Start voice recording"}
                  >
                    {isRecording ? (
                      <MicOff size={16} style={{ color: 'var(--error)' }} />
                    ) : (
                      <Mic size={16} style={{ color: 'var(--foreground)' }} />
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    className={`p-[8px] rounded-[var(--radius)] transition-colors shrink-0 ${
                      isMessageEmpty 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'bg-primary hover:opacity-90'
                    }`}
                    onClick={() => handleSendMessage()}
                    disabled={isMessageEmpty}
                    title="Send message"
                  >
                    <Send size={16} style={{ color: isMessageEmpty ? 'var(--muted)' : 'var(--primary-foreground)' }} />
                  </button>
                </div>
              </div>

              {/* Character Limit Indicator */}
              {showCharLimit && (
                <div className="mt-[6px] flex justify-end">
                  <span
                    style={{
                      fontSize: '11px',
                      color: charCount >= MAX_CHAR_LIMIT ? 'var(--error)' : 'var(--muted)',
                    }}
                  >
                    {charCount} / {MAX_CHAR_LIMIT}
                  </span>
                </div>
              )}
            </div>

            {/* Hint Text */}
            <div className="mt-[6px] flex justify-between items-center">
              <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
