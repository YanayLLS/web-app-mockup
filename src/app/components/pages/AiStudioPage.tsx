import { useState, useRef, useEffect } from 'react';
import svgPaths from '../../../imports/svg-9ja6ioywp2';
import svgPathsFilter from '../../../imports/svg-kzu5oxpmz7';
import svgPathsSelect from '../../../imports/svg-7gjkqr91l0';
import svgPathsChat from '../../../imports/svg-0y0pillmc3';
import { Search, Filter, X, Upload, Trash2, Download, Check, Paperclip, Send, AlertTriangle, Mail, Bug, Loader2, Info, HelpCircle } from 'lucide-react';
import { ModelSelector } from '../ModelSelector';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useRole, hasAccess } from '../../contexts/RoleContext';

interface KnowledgeSource {
  id: string;
  name: string;
  enabled: boolean;
  exposeFile: boolean;
  location: string;
  roles: string;
  createdBy: string;
  lastModified: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  attachments?: string[];
}

type SortColumn = 'name' | 'enabled' | 'exposeFile' | 'location' | 'roles' | 'createdBy' | 'lastModified' | null;

interface ColumnWidths {
  checkbox: number;
  name: number;
  enabled: number;
  exposeFile: number;
  location: number;
  roles: number;
  createdBy: number;
  lastModified: number;
}

const mockKnowledgeSources: KnowledgeSource[] = [
  {
    id: '1',
    name: 'report.docx',
    enabled: true,
    exposeFile: true,
    location: 'Workspace',
    roles: 'Confidential',
    createdBy: 'Alice Smith',
    lastModified: 'June 1',
  },
  {
    id: '2',
    name: 'archive.zip',
    enabled: true,
    exposeFile: true,
    location: 'Workspace',
    roles: 'Historical',
    createdBy: 'Ethan Hunt',
    lastModified: 'October 20',
  },
  {
    id: '3',
    name: 'presentation.pptx',
    enabled: true,
    exposeFile: true,
    location: 'Workspace',
    roles: 'Internal',
    createdBy: 'Bob Johnson',
    lastModified: 'July 15',
  },
  {
    id: '4',
    name: 'guidelines.docx',
    enabled: true,
    exposeFile: true,
    location: 'Workspace',
    roles: 'Public',
    createdBy: 'Fiona Gallagher',
    lastModified: 'November 12',
  },
  {
    id: '5',
    name: 'design_sketch.ai',
    enabled: false,
    exposeFile: false,
    location: 'Workspace',
    roles: 'Design',
    createdBy: 'Charlie Green',
    lastModified: 'August 10',
  },
  {
    id: '6',
    name: 'mockup.png',
    enabled: true,
    exposeFile: true,
    location: 'Workspace',
    roles: 'UI',
    createdBy: 'Gabe Newell',
    lastModified: 'December 18',
  },
  {
    id: '7',
    name: 'video_tutorial.mp4',
    enabled: true,
    exposeFile: true,
    location: 'Workspace',
    roles: 'Training',
    createdBy: 'Hannah Baker',
    lastModified: 'January 25',
  },
  {
    id: '8',
    name: 'spreadsheet.xlsx',
    enabled: false,
    exposeFile: false,
    location: 'Workspace',
    roles: 'Finance',
    createdBy: 'Diana Prince',
    lastModified: 'September 5',
  },
];

const locationOptions = [
  'Workspace',
  'Project Beta',
  'Project Gamma',
  'Project Delta',
  'Project Epsilon',
  'Project Zeta',
  'Project Eta',
  'Project Theta',
  'Project Iota',
  'Project Kappa',
  'Project Lambda',
  'Project Mu',
  'Project Nu',
];

// AI Response templates based on query type
const getAIResponse = (userMessage: string, sources: KnowledgeSource[]): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Question about knowledge sources
  if (lowerMessage.includes('how many') || lowerMessage.includes('count')) {
    const enabledCount = sources.filter(s => s.enabled).length;
    const totalCount = sources.length;
    return `Currently, you have ${enabledCount} enabled knowledge sources out of ${totalCount} total sources. ${
      enabledCount < totalCount ? `There are ${totalCount - enabledCount} disabled sources that are not being used by the AI.` : 'All sources are enabled and available to the AI.'
    }`;
  }
  
  // Question about specific file
  if (lowerMessage.includes('report') || lowerMessage.includes('docx')) {
    const reportFile = sources.find(s => s.name.includes('report'));
    if (reportFile) {
      return `I found "${reportFile.name}" in your knowledge sources. It's currently ${reportFile.enabled ? 'enabled' : 'disabled'} and has the role "${reportFile.roles}". ${
        reportFile.enabled ? 'The AI can access this file.' : 'The AI cannot access this file until it is enabled.'
      }`;
    }
  }
  
  // Question about roles
  if (lowerMessage.includes('role') || lowerMessage.includes('confidential') || lowerMessage.includes('public')) {
    const roles = [...new Set(sources.map(s => s.roles))];
    return `Your knowledge sources are organized into ${roles.length} roles: ${roles.join(', ')}. These roles help control access and categorize your files.`;
  }
  
  // Request to enable/disable
  if (lowerMessage.includes('enable') || lowerMessage.includes('disable')) {
    return `I can help you enable or disable knowledge sources. However, in test mode, I cannot make actual changes to your workspace. Please use the table interface to enable or disable sources, or publish your changes to apply them.`;
  }
  
  // Question about exposed files
  if (lowerMessage.includes('expose') || lowerMessage.includes('exposed')) {
    const exposedCount = sources.filter(s => s.exposeFile).length;
    return `You have ${exposedCount} files marked as exposed. Exposed files are accessible to users and can be downloaded or referenced directly in procedures.`;
  }
  
  // Help request
  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    return `I can help you with:\n• Information about your knowledge sources\n• Counts and statistics\n• File status and roles\n• Questions about enabled/disabled sources\n• Guidance on organizing your knowledge base\n\nFeel free to ask me anything about your knowledge sources!`;
  }
  
  // Search/find request
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('show me')) {
    const enabledSources = sources.filter(s => s.enabled);
    if (enabledSources.length > 0) {
      const fileList = enabledSources.slice(0, 5).map(s => `• ${s.name} (${s.roles})`).join('\n');
      return `Here are ${enabledSources.length > 5 ? 'some of' : 'all'} your enabled knowledge sources:\n\n${fileList}${
        enabledSources.length > 5 ? `\n\n...and ${enabledSources.length - 5} more` : ''
      }`;
    }
  }
  
  // Location/workspace questions
  if (lowerMessage.includes('location') || lowerMessage.includes('workspace') || lowerMessage.includes('where')) {
    const locations = [...new Set(sources.map(s => s.location))];
    return `Your knowledge sources are stored in ${locations.length} location${locations.length > 1 ? 's' : ''}: ${locations.join(', ')}. You can organize files across different projects and workspaces.`;
  }
  
  // Default helpful response
  return `I understand you're asking about "${userMessage}". Based on your current knowledge sources, I can provide information about files, their status, roles, and organization. Could you be more specific about what you'd like to know?`;
};

export function AiStudioPage() {
  const { currentRole } = useRole();
  const canEditAiStudio = hasAccess(currentRole, 'ai-studio-edit');

  const [sources, setSources] = useState<KnowledgeSource[]>(mockKnowledgeSources);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [showTestChat, setShowTestChat] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('frontline-brain');
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [locationSearch, setLocationSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortAscending, setSortAscending] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showTestDisclaimer, setShowTestDisclaimer] = useState(true);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Usage tracking - now using credits instead of tokens
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(15000); // Start at 75%
  const [maxCreditLimit, setMaxCreditLimit] = useState(20000); // Changed to 20,000

  // Listen for debug menu AI usage changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === 'set-ai-credits') {
        setTotalCreditsUsed(detail.used);
        if (detail.max != null) setMaxCreditLimit(detail.max);
      }
    };
    window.addEventListener('flow-debug', handler);
    return () => window.removeEventListener('flow-debug', handler);
  }, []);
  
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    checkbox: 35,
    name: 199,
    enabled: 98,
    exposeFile: 81,
    location: 105,
    roles: 99,
    createdBy: 111,
    lastModified: 90,
  });
  
  const [resizing, setResizing] = useState<keyof ColumnWidths | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const locationSelectRef = useRef<HTMLDivElement>(null);

  // Calculate AI usage state
  const isUnlimited = !maxCreditLimit || maxCreditLimit === 0;
  const usagePercentage = isUnlimited ? 0 : (totalCreditsUsed / maxCreditLimit) * 100;
  const isWarning = usagePercentage >= 80 && usagePercentage < 100;
  const isMaxed = usagePercentage >= 100;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useClickOutside(filterMenuRef, () => setShowFilterMenu(false));
  useClickOutside(locationSelectRef, () => setShowLocationSelect(false));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff);
        setColumnWidths((prev) => ({
          ...prev,
          [resizing]: newWidth,
        }));
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startX, startWidth]);

  const filteredSources = sources
    .filter((source) => {
      const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        selectedLocations.size === 0 || selectedLocations.has(source.location);
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];
      
      if (typeof aVal === 'boolean') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortAscending ? -1 : 1;
      if (aVal > bVal) return sortAscending ? 1 : -1;
      return 0;
    });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }
  };

  const startResize = (column: keyof ColumnWidths, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSources.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSources.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleEnabled = (id: string) => {
    setSources(
      sources.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const toggleExposeFile = (id: string) => {
    setSources(
      sources.map((s) =>
        s.id === id ? { ...s, exposeFile: !s.exposeFile } : s
      )
    );
  };

  const bulkEnable = () => {
    setSources(
      sources.map((s) =>
        selectedIds.has(s.id) ? { ...s, enabled: true } : s
      )
    );
  };

  const bulkDisable = () => {
    setSources(
      sources.map((s) =>
        selectedIds.has(s.id) ? { ...s, enabled: false } : s
      )
    );
  };

  const bulkExpose = () => {
    setSources(
      sources.map((s) =>
        selectedIds.has(s.id) ? { ...s, exposeFile: true } : s
      )
    );
  };

  const bulkDelete = () => {
    setSources(sources.filter((s) => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleUploadFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Files selected:', Array.from(files).map(f => f.name));
        const newSources = Array.from(files).map((file, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          name: file.name,
          enabled: true,
          exposeFile: false,
          location: 'Workspace',
          roles: 'Public',
          createdBy: 'Current User',
          lastModified: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        }));
        setSources([...sources, ...newSources]);
      }
    };
    input.click();
  };

  const handleTest = () => {
    setShowTestChat(true);
    setChatMessages([
      {
        role: 'system',
        content: 'Test mode activated. You can now interact with the AI agent to test how it responds based on your knowledge sources.',
        timestamp: new Date(),
      }
    ]);
    setShowTestDisclaimer(true);
    setAttachedFiles([]);
  };

  const handlePublish = () => {
    setShowPublishModal(true);
  };

  const confirmPublish = () => {
    console.log('Publishing knowledge sources...');
    setShowPublishModal(false);
    if (!isMaxed) {
      // Simulate credit usage increase after publish
      setTotalCreditsUsed(Math.min(totalCreditsUsed + 2000, maxCreditLimit + 5000));
    }
  };

  const handleDiscard = () => {
    setSources(mockKnowledgeSources);
    setSelectedIds(new Set());
  };

  const toggleLocationFilter = (location: string) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(location)) {
      newSelected.delete(location);
    } else {
      newSelected.add(location);
    }
    setSelectedLocations(newSelected);
  };

  const clearFilter = () => {
    setSelectedLocations(new Set());
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setAttachedFiles([...attachedFiles, ...fileNames]);
    }
  };

  const removeAttachment = (fileName: string) => {
    setAttachedFiles(attachedFiles.filter(f => f !== fileName));
  };

  const handleSendMessage = () => {
    if (isMaxed) return;
    if (chatMessage.trim() || attachedFiles.length > 0) {
      const userMsg: ChatMessage = {
        role: 'user',
        content: chatMessage.trim() || '[File attachments only]',
        timestamp: new Date(),
        attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      };
      
      setChatMessages([...chatMessages, userMsg]);
      setChatMessage('');
      setAttachedFiles([]);
      setIsTyping(true);
      
      // Simulate AI thinking and response
      const thinkingTime = 800 + Math.random() * 1200; // 0.8-2s
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse = getAIResponse(userMsg.content, sources);
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
          },
        ]);
        
        // Simulate small credit usage
        setTotalCreditsUsed(prev => Math.min(prev + 10, maxCreditLimit + 5000));
      }, thinkingTime);
    }
  };

  const handleContactSupport = () => {
    const subject = 'Request to increase AI credit limit';
    const body = 'Hi,%0A%0AI would like to increase the AI credit limit for my workspace.%0A%0APlease contact me.%0A%0AThank you.';
    window.location.href = `mailto:support@frontline.io?subject=${subject}&body=${body}`;
  };

  // Debug function to increase usage by 10%
  const handleDebugIncreaseUsage = () => {
    const increment = maxCreditLimit * 0.1; // 10% of max
    setTotalCreditsUsed(Math.min(totalCreditsUsed + increment, maxCreditLimit + 5000));
  };

  // Debug function to decrease usage by 10%
  const handleDebugDecreaseUsage = () => {
    const decrement = maxCreditLimit * 0.1; // 10% of max
    setTotalCreditsUsed(Math.max(totalCreditsUsed - decrement, 0));
  };

  const filteredLocations = locationOptions.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return (
      <div className={`transform ${sortAscending ? 'rotate-90' : '-rotate-90'}`}>
        <svg width="9.5" height="7.36396" fill="none" viewBox="0 0 9.5 7.36396">
          <path d={svgPaths.p28a47700} fill="var(--foreground)" />
        </svg>
      </div>
    );
  };

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="flex flex-col h-full bg-background overflow-hidden"
    >
      {/* AI Usage Bar */}
      <div className="shrink-0 bg-card border-b border-border px-[16px] py-[12px]">
        {isUnlimited ? (
          <div className="flex items-center justify-between">
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--foreground)',
                textAlign: 'center',
                flex: 1,
              }}
            >
              Unlimited AI usage
            </div>
            <div className="flex items-center gap-[8px]">
              <button
                className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-lg border border-border hover:bg-secondary transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted)',
                }}
                onClick={handleDebugDecreaseUsage}
                title="Debug: Decrease usage by 10%"
              >
                <Bug size={14} />
                <span>-10%</span>
              </button>
              <button
                className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-lg border border-border hover:bg-secondary transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted)',
                }}
                onClick={handleDebugIncreaseUsage}
                title="Debug: Increase usage by 10%"
              >
                <Bug size={14} />
                <span>+10%</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {/* Usage Text and Contact Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--foreground)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {formatNumber(totalCreditsUsed)}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    / {formatNumber(maxCreditLimit)} credits used
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px]" style={{
                    background: isMaxed ? 'rgba(255,31,31,0.1)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(47,128,237,0.08)',
                    color: isMaxed ? 'var(--destructive)' : isWarning ? '#f59e0b' : 'var(--primary)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>
                    {Math.round(usagePercentage)}%
                  </span>
                </div>
                {/* Debug Buttons */}
                <div className="flex items-center gap-[8px]">
                  <button
                    className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-lg border border-border hover:bg-secondary transition-colors"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--muted)',
                    }}
                    onClick={handleDebugDecreaseUsage}
                    title="Debug: Decrease usage by 10%"
                  >
                    <Bug size={14} />
                    <span>-10%</span>
                  </button>
                  <button
                    className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-lg border border-border hover:bg-secondary transition-colors"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--muted)',
                    }}
                    onClick={handleDebugIncreaseUsage}
                    title="Debug: Increase usage by 10%"
                  >
                    <Bug size={14} />
                    <span>+10%</span>
                  </button>
                </div>
              </div>

              {/* Contact Support Button (always visible) */}
              <button
                className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-lg border border-border hover:bg-primary/5 hover:border-primary/20 hover:shadow-sm transition-all"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
                onClick={handleContactSupport}
              >
                <Mail size={14} />
                <span>Contact us to increase limit</span>
              </button>
            </div>

            {/* Warning Message */}
            {(isWarning || isMaxed) && (
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-[6px]"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: isMaxed ? 'var(--destructive)' : '#f59e0b',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>
                    {isMaxed
                      ? 'AI usage limit reached for this workspace'
                      : 'AI usage nearing workspace limit'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Progress Bar */}
            <div
              className="w-full h-[6px] rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(usagePercentage, 100)}%`,
                  background: isMaxed
                    ? 'linear-gradient(90deg, #f59e0b, var(--destructive))'
                    : isWarning
                    ? 'linear-gradient(90deg, var(--primary), #f59e0b)'
                    : 'linear-gradient(90deg, var(--primary), #4f9cf7)',
                  boxShadow: isMaxed
                    ? '0 0 8px rgba(255,31,31,0.3)'
                    : isWarning
                    ? '0 0 8px rgba(245,158,11,0.3)'
                    : '0 0 8px rgba(47,128,237,0.2)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      {showInfoBanner && (
        <div className="shrink-0 bg-primary/[0.04] border-b border-primary/15 px-[16px] py-[12px]">
          <div className="flex items-start gap-[12px]">
            <Info 
              size={20} 
              className="shrink-0 mt-0.5" 
              style={{ color: 'var(--primary)' }} 
            />
            <div className="flex-1">
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--foreground)',
                  marginBottom: '4px',
                }}
              >
                Welcome to AI Studio
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  lineHeight: '1.5',
                }}
              >
                AI Studio lets you train custom AI agents with your knowledge sources. Upload files to create a knowledge base, enable or disable sources to control what the AI can access, and test your agent in real-time. Enabled files will appear in the chat context and the AI can reference them when answering questions.
              </div>
            </div>
            <button
              className="shrink-0 p-1 hover:bg-primary/20 rounded-lg transition-colors"
              onClick={() => setShowInfoBanner(false)}
              title="Dismiss"
            >
              <X size={18} style={{ color: 'var(--foreground)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="shrink-0 rounded-lg px-[9px] py-[8px] relative" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-[10px] flex-wrap">
          {/* Search */}
          <div
            className="relative flex items-center justify-between px-[12px] h-[32px] rounded-lg border border-border"
            style={{
              backgroundColor: 'var(--input-background)',
              width: '100%',
              maxWidth: '228px',
              minWidth: '120px',
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none"
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--foreground)',
              }}
            />
            <Search size={10} style={{ color: 'var(--foreground)' }} />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              className={`flex items-center h-[30px] px-[6px] py-[6px] rounded-lg gap-[4px] transition-colors ${
                showFilterMenu || selectedLocations.size > 0 ? 'bg-primary/10' : 'hover:bg-secondary'
              }`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter size={14} style={{ color: 'var(--foreground)' }} />
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}
              >
                Filter
              </span>
            </button>

            {/* Filter Menu */}
            {showFilterMenu && (
              <div
                ref={filterMenuRef}
                className="absolute top-[38px] left-0 z-50 bg-card p-[15px] rounded-lg gap-[6px] flex flex-col"
                style={{
                  width: '436px',
                  maxWidth: 'calc(100vw - 32px)',
                  border: '2px solid var(--border)',
                  boxShadow: 'var(--elevation-sm)',
                }}
              >
                {/* Filter Header */}
                <div className="flex items-center justify-between px-[2px]">
                  <div
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--foreground)',
                    }}
                  >
                    Filter by
                  </div>
                  <button
                    onClick={clearFilter}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--primary)',
                    }}
                    className="hover:underline"
                  >
                    clear filter
                  </button>
                </div>

                {/* Location Filter */}
                <div className="flex items-center gap-[6px] p-[6px]">
                  <div
                    className="flex-1"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--foreground)',
                    }}
                  >
                    Location
                  </div>
                  <div className="relative">
                    <button
                      className="h-[30px] px-[6px] rounded-lg border border-border flex items-center justify-between"
                      style={{
                        width: '100%',
                        maxWidth: '252px',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--foreground)',
                      }}
                      onClick={() => setShowLocationSelect(!showLocationSelect)}
                    >
                      <span>Select location</span>
                      <svg width="23.99" height="23.99" fill="none" viewBox="0 0 23.99 23.99">
                        <path d={svgPathsFilter.p1cdea100} fill="var(--foreground)" />
                      </svg>
                    </button>

                    {/* Location Select Panel */}
                    {showLocationSelect && (
                      <div
                        ref={locationSelectRef}
                        className="absolute top-[36px] right-0 z-50 bg-card p-[12px] rounded-lg flex flex-col gap-[6px]"
                        style={{
                          width: '280px',
                          maxWidth: 'calc(100vw - 32px)',
                          maxHeight: '400px',
                          boxShadow: '0px 4px 15.4px 0px rgba(0,0,0,0.25)',
                        }}
                      >
                        {/* Search */}
                        <div
                          className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-lg border border-primary"
                          style={{
                            backgroundColor: 'var(--input-background)',
                            height: '35px',
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Search..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none"
                            style={{
                              fontSize: 'var(--text-sm)',
                              color: 'var(--foreground)',
                            }}
                          />
                          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                            <path d={svgPathsSelect.p225d3000} fill="var(--foreground)" />
                          </svg>
                        </div>

                        {/* Location List */}
                        <div className="flex flex-col gap-px overflow-y-auto custom-scrollbar" style={{ maxHeight: '300px' }}>
                          {filteredLocations.map((location) => (
                            <div
                              key={location}
                              className="flex items-center gap-[10px] p-[6px] border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                              onClick={() => toggleLocationFilter(location)}
                            >
                              <div
                                className="w-[20px] h-[20px] rounded-[5px] border-[1.5px] flex items-center justify-center"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                {selectedLocations.has(location) && (
                                  <div
                                    className="w-[12px] h-[12px] rounded-[3px]"
                                    style={{ backgroundColor: 'var(--primary)' }}
                                  />
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  color: 'var(--foreground)',
                                }}
                              >
                                {location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Upload Files Button with Tooltip */}
          <div 
            className="relative"
            onMouseEnter={() => setShowUploadTooltip(true)}
            onMouseLeave={() => setShowUploadTooltip(false)}
          >
            <button
              className={`flex items-center gap-[6px] justify-center h-[30px] px-[12px] py-[8px] rounded-lg transition-opacity ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontSize: '10px',
                fontWeight: 'var(--font-weight-bold)',
              }}
              onClick={canEditAiStudio ? handleUploadFiles : undefined}
              disabled={!canEditAiStudio}
            >
              <Upload size={14} />
              Upload files
            </button>
            
            {/* Tooltip */}
            {showUploadTooltip && (
              <div 
                className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-lg border border-border pointer-events-none z-50"
                style={{
                  backgroundColor: 'var(--card)',
                  boxShadow: 'var(--elevation-md)',
                  width: '280px',
                  maxWidth: 'calc(100vw - 32px)',
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle 
                    size={16} 
                    className="shrink-0 mt-0.5" 
                    style={{ color: 'var(--primary)' }} 
                  />
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--foreground)',
                        }}
                  >
                    Upload Knowledge Sources
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted)',
                      lineHeight: '1.4',
                  }}
                >
                  Files you upload will be added to your knowledge base. Enable them in the table to make them accessible to your AI agent in chat conversations.
                </div>
                {/* Arrow */}
                <div 
                  className="absolute top-full right-6 w-0 h-0"
                  style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid var(--card)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'white' }}>
        <div className="min-w-full">
          {/* Table Header */}
          <div className="shrink-0 border-b border-border relative" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-[10px] px-[8px] py-[10px]">
              {/* Checkbox Column */}
              <div className="flex items-center" style={{ width: `${columnWidths.checkbox}px` }}>
                <button
                  className={`w-[20px] h-[20px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50'}`}
                  style={{ borderColor: 'var(--border)' }}
                  onClick={canEditAiStudio ? toggleSelectAll : undefined}
                  disabled={!canEditAiStudio}
                >
                  {selectedIds.size === filteredSources.length &&
                    filteredSources.length > 0 && (
                      <div
                        className="w-[12px] h-[12px] rounded-[3px]"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                </button>
              </div>

              {/* Name Column */}
              <div
                className={`flex items-center gap-[10px] h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'name' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.name}px` }}
                onClick={() => handleSort('name')}
                onMouseEnter={() => setHoveredColumn('name')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Name
                </span>
                <SortIcon column="name" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('name', e)}
                />
              </div>

              {/* Enabled Column */}
              <div
                className={`flex items-center gap-[4px] h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'enabled' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.enabled}px` }}
                onClick={() => handleSort('enabled')}
                onMouseEnter={() => setHoveredColumn('enabled')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Enabled
                </span>
                <div 
                  title="Enabled files are accessible to the AI agent in chat conversations"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info size={12} style={{ color: 'var(--muted)' }} className="cursor-help" />
                </div>
                <SortIcon column="enabled" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('enabled', e)}
                />
              </div>

              {/* Expose File Column */}
              <div
                className={`flex items-center h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'exposeFile' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.exposeFile}px` }}
                onClick={() => handleSort('exposeFile')}
                onMouseEnter={() => setHoveredColumn('exposeFile')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Expose File
                </span>
                <SortIcon column="exposeFile" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('exposeFile', e)}
                />
              </div>

              {/* Location Column */}
              <div
                className={`flex items-center h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'location' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.location}px` }}
                onClick={() => handleSort('location')}
                onMouseEnter={() => setHoveredColumn('location')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Location
                </span>
                <SortIcon column="location" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('location', e)}
                />
              </div>

              {/* Roles Column */}
              <div
                className={`flex items-center h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'roles' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.roles}px` }}
                onClick={() => handleSort('roles')}
                onMouseEnter={() => setHoveredColumn('roles')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Roles
                </span>
                <SortIcon column="roles" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('roles', e)}
                />
              </div>

              {/* Created by Column */}
              <div
                className={`flex items-center h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'createdBy' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.createdBy}px` }}
                onClick={() => handleSort('createdBy')}
                onMouseEnter={() => setHoveredColumn('createdBy')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Created by
                </span>
                <SortIcon column="createdBy" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('createdBy', e)}
                />
              </div>

              {/* Last modified Column */}
              <div
                className={`flex items-center h-[22px] cursor-pointer relative transition-colors ${
                  hoveredColumn === 'lastModified' ? 'bg-secondary/20' : ''
                }`}
                style={{ width: `${columnWidths.lastModified}px` }}
                onClick={() => handleSort('lastModified')}
                onMouseEnter={() => setHoveredColumn('lastModified')}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  Last modified
                </span>
                <SortIcon column="lastModified" />
                <div
                  className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-primary/20"
                  onMouseDown={(e) => startResize('lastModified', e)}
                />
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="h-[40px] flex items-center hover:bg-secondary/30 transition-colors"
              style={{ backgroundColor: 'white' }}
            >
              <div className="flex items-center px-[8px] py-[2px] w-full gap-[10px]">
                {/* Checkbox */}
                <div className="flex items-center" style={{ width: `${columnWidths.checkbox}px` }}>
                  <button
                    className={`w-[20px] h-[20px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50'}`}
                    style={{ borderColor: 'var(--border)' }}
                    onClick={canEditAiStudio ? () => toggleSelect(source.id) : undefined}
                    disabled={!canEditAiStudio}
                  >
                    {selectedIds.has(source.id) && (
                      <div
                        className="w-[12px] h-[12px] rounded-[3px]"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                  </button>
                </div>

                {/* File Name */}
                <div className="flex items-center gap-[10px] h-[36px] p-[6px]" style={{ width: `${columnWidths.name}px` }}>
                  <div
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {source.name}
                  </div>
                  <button className="w-[16px] h-[16px] hover:opacity-70 transition-opacity">
                    <Download size={16} style={{ color: 'var(--foreground)' }} />
                  </button>
                </div>

                {/* Enabled Status */}
                <div className="h-[32px] flex items-center" style={{ width: `${columnWidths.enabled}px` }}>
                  <button
                    className={`px-[10px] py-[4px] rounded-full text-[11px] transition-all ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    style={{
                      backgroundColor: source.enabled
                        ? 'rgba(17,232,116,0.1)'
                        : 'rgba(0,0,0,0.04)',
                      color: source.enabled ? '#0a9e4a' : 'var(--muted)',
                      fontWeight: 'var(--font-weight-semibold)',
                      border: source.enabled ? '1px solid rgba(17,232,116,0.15)' : '1px solid transparent',
                    }}
                    onClick={canEditAiStudio ? () => toggleEnabled(source.id) : undefined}
                    disabled={!canEditAiStudio}
                  >
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Expose File */}
                <div className="flex items-center justify-center" style={{ width: `${columnWidths.exposeFile}px` }}>
                  {source.enabled ? (
                    <button
                      className={`w-[28px] h-[28px] rounded-md transition-all flex items-center justify-center ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
                      onClick={canEditAiStudio ? () => toggleExposeFile(source.id) : undefined}
                      disabled={!canEditAiStudio}
                    >
                      {source.exposeFile ? (
                        <X size={15} style={{ color: 'var(--muted)' }} />
                      ) : (
                        <Check size={16} style={{ color: 'var(--accent)' }} />
                      )}
                    </button>
                  ) : (
                    <div className="w-[25px] h-[28px]" />
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center p-[8px]" style={{ width: `${columnWidths.location}px` }}>
                  <span
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {source.location}
                  </span>
                </div>

                {/* Roles */}
                <div className="flex items-center h-[26px] p-[4px] rounded-lg" style={{ width: `${columnWidths.roles}px` }}>
                  <span
                    className="overflow-hidden text-ellipsis whitespace-nowrap px-2 py-0.5 rounded-md"
                    style={{
                      fontSize: '11px',
                      color: 'var(--foreground)',
                      background: 'var(--secondary)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {source.roles}
                  </span>
                </div>

                {/* Created by */}
                <div className="flex items-center h-[20px]" style={{ width: `${columnWidths.createdBy}px` }}>
                  <span
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {source.createdBy}
                  </span>
                </div>

                {/* Last modified */}
                <div className="flex items-center h-[36px]" style={{ width: `${columnWidths.lastModified}px` }}>
                  <span
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {source.lastModified}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredSources.length === 0 && (
            <div
              className="flex items-center justify-center py-[60px]"
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--muted)',
                backgroundColor: 'white',
              }}
            >
              No knowledge sources found
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar with Selection Actions */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 py-[12px] px-[16px] border-t border-border bg-card max-w-[calc(100vw-32px)]">
          <div className="flex items-center justify-center gap-[12px] flex-wrap">
            <div className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-lg border border-border bg-background">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <button
                className="w-[14px] h-[14px] hover:opacity-70 transition-opacity"
                onClick={clearSelection}
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                  <path d={svgPaths.p2dc32500} fill="var(--foreground)" />
                </svg>
              </button>
            </div>

            <button
              className={`px-[12px] py-[6px] rounded-lg border border-border transition-colors ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}
              onClick={canEditAiStudio ? () => console.log('Specify roles for selected') : undefined}
              disabled={!canEditAiStudio}
            >
              Specify roles
            </button>

            <button
              className={`px-[12px] py-[6px] rounded-lg border border-border transition-colors ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}
              onClick={canEditAiStudio ? bulkEnable : undefined}
              disabled={!canEditAiStudio}
            >
              Enable
            </button>

            <button
              className={`px-[12px] py-[6px] rounded-lg border border-border transition-colors ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}
              onClick={canEditAiStudio ? bulkDisable : undefined}
              disabled={!canEditAiStudio}
            >
              Disable
            </button>

            <button
              className={`px-[12px] py-[6px] rounded-lg border border-border transition-colors ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}
              onClick={canEditAiStudio ? bulkExpose : undefined}
              disabled={!canEditAiStudio}
            >
              Expose
            </button>

            <button
              className={`w-[32px] h-[32px] rounded-lg border border-border transition-colors flex items-center justify-center ${!canEditAiStudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-destructive/10'}`}
              onClick={canEditAiStudio ? bulkDelete : undefined}
              disabled={!canEditAiStudio}
            >
              <Trash2 size={16} style={{ color: 'var(--destructive)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="shrink-0 h-[60px] flex items-center justify-between px-[16px] border-t border-border bg-card">
        {canEditAiStudio ? (
          <button
            className="px-[16px] py-[8px] rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: 'var(--text-base)', color: 'var(--foreground)' }}
            onClick={handleDiscard}
          >
            Discard
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-[12px]">
          <button
            className="px-[16px] py-[8px] rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ fontSize: 'var(--text-base)', color: 'var(--foreground)' }}
            onClick={handleTest}
            title="Open test chat to interact with your AI agent using enabled knowledge sources"
          >
            Test
          </button>

          {canEditAiStudio && (
            <button
              className="px-[16px] py-[8px] rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontSize: 'var(--text-base)',
              }}
              onClick={handlePublish}
              title="Save and publish your knowledge sources to make them live for all users"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[16px]">
          <div
            className="bg-card rounded-lg p-[24px] flex flex-col gap-[20px] w-full max-w-[480px]"
            style={{
              boxShadow: 'var(--elevation-lg)',
            }}
          >
            <div className="flex flex-col gap-[12px]">
              <div
                style={{
                  fontSize: 'var(--text-h3)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--foreground)',
                }}
              >
                Publish Knowledge Sources
              </div>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--foreground)',
                }}
              >
                Are you sure you want to publish these changes? This will make all enabled knowledge sources available to the AI agent.
              </p>
              
              {/* Summary */}
              <div
                className="p-[12px] rounded-lg border border-border bg-background"
              >
                <div className="flex flex-col gap-[8px]">
                  <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--muted)' }}>Total sources:</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-bold)' }}>
                      {sources.length}
                    </span>
                  </div>
                  <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--muted)' }}>Enabled sources:</span>
                    <span style={{ color: '#1f9254', fontWeight: 'var(--font-weight-bold)' }}>
                      {sources.filter(s => s.enabled).length}
                    </span>
                  </div>
                  <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--muted)' }}>Exposed files:</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-bold)' }}>
                      {sources.filter(s => s.exposeFile).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-[12px]">
              <button
                className="px-[16px] py-[8px] rounded-lg hover:bg-secondary transition-colors"
                style={{ fontSize: 'var(--text-base)', color: 'var(--foreground)' }}
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-[16px] py-[8px] rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontSize: 'var(--text-base)',
                }}
                onClick={confirmPublish}
              >
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Chat Modal */}
      {showTestChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[20px]">
          <div
            className="bg-card rounded-lg overflow-hidden w-full max-w-[500px] max-h-[90vh]"
            style={{
              height: '700px',
              border: '1px solid #2F80ED',
              boxShadow: '0px 4px 99.8px 0px rgba(14,122,254,0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Chat Header */}
            <div className="p-[16px] flex items-center gap-[12px] relative shrink-0 border-b border-border">
              <div className="flex-1" />
              <div className="flex items-center gap-[8px]">
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)',
                    }}
                >
                  Test Agent
                </div>
                <span style={{ color: 'var(--muted)' }}>•</span>
                {/* Model Selector */}
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  compact
                />
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  className="w-[32px] h-[32px] flex items-center justify-center hover:opacity-70 transition-opacity rounded-lg hover:bg-secondary"
                  onClick={() => setShowTestChat(false)}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path d={svgPathsChat.p2dc32500} fill="var(--foreground)" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Test Disclaimer */}
            {showTestDisclaimer && (
              <div className="mx-[16px] mt-[16px] bg-accent/10 border border-accent/30 rounded-lg p-[12px] flex items-start gap-[12px] shrink-0">
                <Info size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <div className="flex-1">
                  <p
                    className="mb-1"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--foreground)',
                        }}
                  >
                    Test Mode
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--foreground)',
                        }}
                  >
                    The AI has access to all enabled knowledge sources from the table. Files you attach will be added to the conversation context. This is test mode — no changes are saved to your workspace.
                  </p>
                </div>
                <button
                  className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 shrink-0 rounded-lg hover:bg-secondary"
                  onClick={() => setShowTestDisclaimer(false)}
                >
                  <X size={16} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-[16px] py-[16px] min-h-0">
              {/* Empty State Helper */}
              {chatMessages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-[400px] text-center">
                    <div className="mb-4 flex justify-center">
                      <div 
                        className="p-4 rounded-full"
                        style={{ backgroundColor: 'var(--primary)/10' }}
                      >
                        <HelpCircle size={32} style={{ color: 'var(--primary)' }} />
                      </div>
                    </div>
                    <div
                      className="mb-2"
                      style={{
                        fontSize: 'var(--text-h3)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--foreground)',
                            }}
                    >
                      Test Your AI Agent
                    </div>
                    <div
                      className="mb-4"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--muted)',
                              lineHeight: '1.5',
                      }}
                    >
                      Ask questions to test how your AI agent responds. You can attach files from your knowledge sources using the paperclip icon. Enabled files in your knowledge base are automatically available to the AI.
                    </div>
                    <div className="flex flex-col gap-2 items-start text-left bg-secondary/30 rounded-lg p-4">
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--foreground)',
                                }}
                      >
                        Try asking:
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--foreground)',
                                }}
                      >
                        • "How many knowledge sources are enabled?"
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--foreground)',
                                }}
                      >
                        • "What files do you have access to?"
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--foreground)',
                                }}
                      >
                        • "Tell me about the report file"
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-[16px] ${
                    msg.role === 'system' ? 'flex justify-center' : ''
                  }`}
                >
                  {msg.role === 'system' ? (
                    <div
                      className="px-[16px] py-[8px] rounded-lg bg-secondary/30 max-w-[80%]"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--muted)',
                        textAlign: 'center',
                      }}
                    >
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className={`p-[14px] rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary/10 ml-[60px]'
                          : 'bg-secondary/50 mr-[60px]'
                      }`}
                    >
                      <div className="flex items-center gap-[8px] mb-[6px]">
                        <span
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: msg.role === 'user' ? 'var(--primary)' : 'var(--foreground)',
                          }}
                        >
                          {msg.role === 'user' ? 'You' : 'AI Agent'}
                        </span>
                        {msg.timestamp && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--muted)',
                            }}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-[8px] flex flex-wrap gap-[6px]">
                          {msg.attachments.map((file, fileIdx) => (
                            <div
                              key={fileIdx}
                              className="px-[8px] py-[4px] rounded-lg bg-background border border-border flex items-center gap-[6px]"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              <Paperclip size={12} style={{ color: 'var(--muted)' }} />
                              <span style={{ color: 'var(--foreground)' }}>{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--foreground)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.5',
                        }}
                      >
                        {msg.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="mb-[16px] mr-[60px]">
                  <div className="p-[14px] rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-[8px] mb-[6px]">
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--foreground)',
                        }}
                      >
                        AI Agent
                      </span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-[16px] shrink-0 border-t border-border">
              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="mb-[12px] flex flex-wrap gap-[8px]">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="px-[10px] py-[6px] rounded-lg bg-secondary border border-border flex items-center gap-[8px]"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      <Paperclip size={14} style={{ color: 'var(--foreground)' }} />
                      <span style={{ color: 'var(--foreground)' }}>{file}</span>
                      <button
                        onClick={() => removeAttachment(file)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X size={14} style={{ color: 'var(--muted)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="rounded-lg border-[2px]"
                style={{
                  borderColor: 'var(--primary)',
                  backgroundColor: 'var(--input-background)',
                  boxShadow: '0px 0px 10px 0px rgba(151,71,255,0.3)',
                }}
              >
                <div className="p-[8px]">
                  <textarea
                    placeholder="Write your instructions here..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full bg-transparent border-none outline-none resize-none custom-scrollbar"
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--foreground)',
                      minHeight: '60px',
                      maxHeight: '120px',
                    }}
                    rows={2}
                  />
                  <div className="flex items-center gap-[12px] pt-[8px] border-t border-border mt-[8px]">
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
                      Context:
                    </div>
                    <div className="flex-1 flex items-center gap-[6px]">
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                        Knowledge Sources
                      </div>
                      <div 
                        className="group relative"
                        title="The AI can access all enabled knowledge sources automatically"
                      >
                        <Info size={14} style={{ color: 'var(--muted)' }} className="cursor-help" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      className="w-[36px] h-[36px] rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                      onClick={handleAttachFile}
                      title="Attach files"
                    >
                      <Paperclip size={18} style={{ color: 'var(--foreground)' }} />
                    </button>
                    <button
                      className="w-[36px] h-[36px] rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors shrink-0"
                      style={{ backgroundColor: chatMessage.trim() || attachedFiles.length > 0 ? 'var(--primary)' : 'transparent' }}
                      onClick={handleSendMessage}
                      disabled={isMaxed || (!chatMessage.trim() && attachedFiles.length === 0)}
                      title="Send message"
                    >
                      <Send
                        size={18}
                        style={{
                          color: chatMessage.trim() || attachedFiles.length > 0
                            ? 'var(--primary-foreground)'
                            : 'var(--muted)',
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
