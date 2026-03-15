import { Search, FolderOpen, FileText, Box, Film, ChevronRight, Clock, MoreVertical, X, Mic, MicOff, Sparkles, Star, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  name: string;
  type: 'folder' | 'procedure' | 'digital-twin' | 'media';
  project: string;
  projectId: string;
  path?: string;
  description?: string;
  date: string;
  tags?: string[];
}

interface HistoryItem {
  id: string;
  text: string;
  type: 'folder' | 'procedure' | 'project';
}

const searchHistory: HistoryItem[] = [
  { id: 'h1', text: 'Daily', type: 'folder' },
  { id: 'h2', text: 'Cylinder pressure check', type: 'procedure' },
  { id: 'h3', text: '915 iS', type: 'project' },
  { id: 'h4', text: '914 series', type: 'project' },
];

const allResults: SearchResult[] = [
  { id: '1', name: 'Maintenance Procedures', type: 'folder', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Documentation', date: '2 days ago', tags: ['maintenance', 'docs'] },
  { id: '2', name: 'Routine Maintenance for High-Volume Printing', type: 'procedure', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Procedures / Maintenance', date: '4 hours ago', tags: ['maintenance', 'printing', 'routine'], description: 'Complete routine maintenance procedure covering safety prep, belt inspection, and lubrication.' },
  { id: '3', name: 'Engine Calibration Procedure', type: 'procedure', project: 'Manufacturing Alpha', projectId: 'manufacturing-alpha', path: 'Manufacturing Alpha / Procedures', date: '1 day ago', tags: ['engine', 'calibration'], description: 'Step-by-step calibration for engine timing, fuel mixture, and governor settings.' },
  { id: '4', name: 'Main Engine Assembly', type: 'digital-twin', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Digital Twins', date: '1 week ago', tags: ['engine', '3D model'] },
  { id: '5', name: 'Installation Tutorial Video', type: 'media', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Media / Tutorials', date: '2 days ago', tags: ['tutorial', 'video'] },
  { id: '6', name: 'Safety Protocols', type: 'folder', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Documentation', date: '1 week ago', tags: ['safety'] },
  { id: '7', name: 'Belt Replacement Guide', type: 'procedure', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Procedures / Repair', date: '3 days ago', tags: ['belt', 'repair'], description: 'Guide for inspecting and replacing drive belts including tensioner adjustment.' },
  { id: '8', name: 'CNC Machine X500 Setup', type: 'procedure', project: 'Manufacturing Alpha', projectId: 'manufacturing-alpha', path: 'Manufacturing Alpha / Procedures / Setup', date: '5 hours ago', tags: ['CNC', 'setup'] },
  { id: '9', name: 'Assembly Line Robot AR-2000', type: 'digital-twin', project: 'Manufacturing Alpha', projectId: 'manufacturing-alpha', path: 'Manufacturing Alpha / Digital Twins', date: '2 days ago', tags: ['robot', '3D model'] },
  { id: '10', name: 'Wiring Diagram', type: 'media', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Media / Diagrams', date: '1 week ago', tags: ['wiring', 'diagram'] },
  { id: '11', name: 'Hydraulic System', type: 'digital-twin', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Digital Twins', date: '5 days ago', tags: ['hydraulic', '3D model'] },
  { id: '12', name: 'Training Materials', type: 'folder', project: '915 i Series', projectId: '915-i-series', path: '915 i Series / Documentation', date: '3 days ago', tags: ['training'] },
  { id: '13', name: 'Preventive Maintenance Procedure', type: 'procedure', project: 'Generator', projectId: 'generator', path: 'Generator / Procedures', date: '1 day ago', tags: ['preventive', 'maintenance', 'generator'], description: 'Complete 10-step preventive maintenance covering lockout, oil, coolant, and load testing.' },
  { id: '14', name: 'Air Filter Replacement', type: 'procedure', project: 'Generator', projectId: 'generator', path: 'Generator / Procedures', date: '3 days ago', tags: ['air filter', 'generator'], description: 'Step-by-step guide for removing, inspecting, and replacing the engine air filter.' },
  { id: '15', name: 'Coolant System Flush & Refill', type: 'procedure', project: 'Generator', projectId: 'generator', path: 'Generator / Procedures', date: '5 days ago', tags: ['coolant', 'generator'] },
  { id: '16', name: 'Generator Digital Twin', type: 'digital-twin', project: 'Generator', projectId: 'generator', path: 'Generator / Digital Twins', date: '1 day ago', tags: ['generator', '3D model'] },
  { id: '17', name: 'Fuel Filter & Water Separator Service', type: 'procedure', project: 'Generator', projectId: 'generator', path: 'Generator / Procedures', date: '2 days ago', tags: ['fuel', 'filter', 'generator'] },
  { id: '18', name: 'Alternator Belt Removal & Installation', type: 'procedure', project: 'Generator', projectId: 'generator', path: 'Generator / Procedures', date: '4 days ago', tags: ['alternator', 'belt', 'generator'] },
];

// Quick-access suggestions shown in empty state
const quickAccess = [
  { label: 'Maintenance procedures', query: 'maintenance' },
  { label: 'Generator guides', query: 'generator' },
  { label: 'Digital twins', query: 'digital twin' },
  { label: 'Safety protocols', query: 'safety' },
];

const typeIcons: Record<string, typeof FolderOpen> = {
  folder: FolderOpen,
  procedure: FileText,
  'digital-twin': Box,
  media: Film,
  project: FolderOpen,
};

const typeColors: Record<string, string> = {
  folder: '#2F80ED',
  procedure: '#36415D',
  'digital-twin': '#8404B3',
  media: '#11E874',
  project: '#2F80ED',
};

type FilterKey = 'all' | 'folder' | 'procedure' | 'digital-twin' | 'media';

const filterLabels: Record<FilterKey, string> = {
  all: 'All',
  folder: 'Projects',
  procedure: 'Flows',
  'digital-twin': 'Digital Twins',
  media: 'Media',
};

// Relevance scoring: exact name match > starts-with > name contains > description/tag match
function scoreResult(r: SearchResult, q: string): number {
  if (!q) return 0;
  const lower = q.toLowerCase();
  const nameLower = r.name.toLowerCase();
  if (nameLower === lower) return 100;
  if (nameLower.startsWith(lower)) return 80;
  if (nameLower.includes(lower)) return 60;
  if (r.project.toLowerCase().includes(lower)) return 40;
  if (r.description?.toLowerCase().includes(lower)) return 30;
  if (r.tags?.some(t => t.toLowerCase().includes(lower))) return 20;
  return 0;
}

// Voice recognition hook
function useVoiceSearch(onInterim: (text: string) => void, onFinal: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const levelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          onInterim(currentText);
        }

        // Reset the 2-second silence timer on every new speech result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          // 2 seconds of silence: auto-trigger search and stop
          if (currentText) {
            onFinal(currentText);
          }
          recognition.stop();
        }, 2000);
      };

      recognition.onerror = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (levelIntervalRef.current) {
          clearInterval(levelIntervalRef.current);
          levelIntervalRef.current = null;
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        setVoiceLevel(0);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [onInterim, onFinal]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        levelIntervalRef.current = setInterval(() => {
          setVoiceLevel(Math.random() * 100);
        }, 100);
      } catch {
        // Already started
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, isSupported, voiceLevel, startListening, stopListening };
}

// Extend Window for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface AppSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function AppSearchModal({ isOpen, onClose, initialQuery = '' }: AppSearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice: interim fills the field live, final triggers full results
  const handleVoiceInterim = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleVoiceFinal = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const { isListening, isSupported: voiceSupported, voiceLevel, startListening, stopListening } = useVoiceSearch(handleVoiceInterim, handleVoiceFinal);

  useEffect(() => {
    if (isOpen && inputRef.current && !isListening) {
      inputRef.current.focus();
    }
  }, [isOpen, isListening]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isListening) {
          stopListening();
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose, isListening, stopListening]);

  // Search across name, project, description, and tags
  const matchesSearch = (r: SearchResult, q: string) => {
    if (!q) return true;
    return scoreResult(r, q) > 0;
  };

  // Live-filter: results update on every keystroke, sorted by relevance
  const filteredResults = query.trim()
    ? allResults
        .filter(r => {
          const matchesQuery = matchesSearch(r, query);
          const matchesFilter = activeFilter === 'all' || r.type === activeFilter;
          return matchesQuery && matchesFilter;
        })
        .sort((a, b) => scoreResult(b, query) - scoreResult(a, query))
    : [];

  const groupLabels: Record<string, string> = {
    folder: 'Projects',
    procedure: 'Flows',
    'digital-twin': 'Digital Twins',
    media: 'Media',
  };

  // Group results while preserving relevance order within each group
  const grouped = filteredResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const group = groupLabels[r.type] || r.type;
    if (!acc[group]) acc[group] = [];
    acc[group].push(r);
    return acc;
  }, {});

  const allMatchingQuery = query.trim()
    ? allResults.filter(r => matchesSearch(r, query))
    : [];
  const filterCounts: Record<FilterKey, number> = {
    all: allMatchingQuery.length,
    folder: allMatchingQuery.filter(r => r.type === 'folder').length,
    procedure: allMatchingQuery.filter(r => r.type === 'procedure').length,
    'digital-twin': allMatchingQuery.filter(r => r.type === 'digital-twin').length,
    media: allMatchingQuery.filter(r => r.type === 'media').length,
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilter('all');
    inputRef.current?.focus();
  };

  const handleHistoryClick = (text: string) => {
    setQuery(text);
  };

  const handleQuickAccess = (q: string) => {
    setQuery(q);
  };

  // Click a result → navigate to item and close search
  const handleResultClick = (result: SearchResult) => {
    onClose();
    if (result.type === 'folder') {
      navigate(`/app/project/${result.projectId}/folder/${result.id}`);
    } else {
      navigate(`/app/project/${result.projectId}/kb?open=${result.id}`);
    }
  };

  const handleContextMenuClick = (e: React.MouseEvent, resultId: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ id: resultId, x: rect.right, y: rect.bottom });
  };

  const maxGroupItems = 4;
  const hasQuery = query.trim().length > 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center z-50 pt-4 sm:pt-12 px-2 sm:px-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-card rounded-[var(--radius)] shadow-elevation-lg border border-border overflow-hidden flex flex-col w-full sm:w-auto"
          style={{ maxWidth: 'min(600px, calc(100vw - 16px))', maxHeight: 'calc(100vh - 32px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input with voice */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={isListening ? 'Listening...' : 'Search all knowledge base content...'}
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full h-12 sm:h-10 pl-10 pr-10 rounded-lg text-sm bg-secondary border-none outline-none text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                {hasQuery && !isListening && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-foreground"
                    title="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Voice search button */}
              {voiceSupported && (
                <button
                  onClick={() => isListening ? stopListening() : startListening()}
                  className="relative shrink-0 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: isListening ? '#2F80ED' : '#F5F5F5',
                    color: isListening ? 'white' : '#868D9E',
                    border: isListening ? '2px solid #2F80ED' : '1px solid #E9E9E9',
                  }}
                  title={isListening ? 'Stop listening' : 'Voice search'}
                >
                  {isListening ? (
                    <>
                      <span
                        className="absolute inset-0 rounded-lg animate-ping"
                        style={{ backgroundColor: '#2F80ED', opacity: 0.3 }}
                      />
                      <span
                        className="absolute inset-0 rounded-lg transition-all duration-100"
                        style={{
                          border: `${2 + (voiceLevel / 100) * 3}px solid rgba(47, 128, 237, ${0.3 + (voiceLevel / 100) * 0.4})`,
                          transform: `scale(${1 + (voiceLevel / 100) * 0.15})`,
                        }}
                      />
                      <MicOff className="size-4 relative z-10" />
                    </>
                  ) : (
                    <Mic className="size-4" />
                  )}
                </button>
              )}
            </div>

            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center gap-2 mt-3 px-1">
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-150"
                      style={{
                        width: '3px',
                        height: `${8 + Math.sin((voiceLevel / 100) * Math.PI + i * 0.8) * 10}px`,
                        backgroundColor: '#2F80ED',
                        opacity: 0.6 + (voiceLevel / 100) * 0.4,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: '#2F80ED', fontWeight: 'var(--font-weight-medium)' }}>
                  Speak now — results update live. Auto-searches after 2s of silence.
                </span>
              </div>
            )}

            {/* Filter chips - when there's a query */}
            {hasQuery && !isListening && (
              <div className="flex gap-1.5 overflow-x-auto mt-3">
                {(['all', 'folder', 'procedure', 'digital-twin', 'media'] as FilterKey[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs whitespace-nowrap transition-colors
                      ${activeFilter === f ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                    style={{ fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {filterLabels[f]} ({filterCounts[f]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Empty state — no query typed */}
            {!hasQuery && !isListening && (
              <div>
                {/* Quick access chips */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="size-3.5" style={{ color: '#8404B3' }} />
                    <span className="text-xs uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-semibold)', color: '#868D9E' }}>
                      Quick access
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickAccess.map((qa) => (
                      <button
                        key={qa.query}
                        onClick={() => handleQuickAccess(qa.query)}
                        className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-full text-xs transition-colors hover:bg-[#D9E0F0]"
                        style={{
                          backgroundColor: '#F5F5F5',
                          color: '#36415D',
                          fontWeight: 'var(--font-weight-medium)',
                          border: '1px solid #E9E9E9',
                        }}
                      >
                        <ArrowRight className="size-3" style={{ color: '#2F80ED' }} />
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice hint */}
                {voiceSupported && (
                  <button
                    onClick={startListening}
                    className="w-full flex items-center gap-3 p-3 rounded-xl mb-4 transition-colors hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #F0E6FF 0%, #E6F0FF 100%)',
                      border: '1px solid #E0D4F5',
                    }}
                  >
                    <div
                      className="size-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#8404B3' }}
                    >
                      <Mic className="size-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm" style={{ fontWeight: 'var(--font-weight-semibold)', color: '#36415D' }}>
                        Try voice search
                      </div>
                      <div className="text-xs" style={{ color: '#868D9E' }}>
                        Tap the mic and describe what you need
                      </div>
                    </div>
                  </button>
                )}

                {/* Recent searches */}
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-3.5 text-muted" />
                  <span className="text-xs text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    Recent searches
                  </span>
                </div>
                <div className="space-y-0.5">
                  {searchHistory.map((item) => {
                    const Icon = typeIcons[item.type];
                    const color = typeColors[item.type];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleHistoryClick(item.text)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] hover:bg-secondary rounded-lg transition-colors text-left"
                      >
                        <div
                          className="size-7 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="size-3.5" style={{ color }} />
                        </div>
                        <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {item.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Favorites section */}
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="size-3.5" style={{ color: '#FF9500' }} />
                    <span className="text-xs uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-semibold)', color: '#868D9E' }}>
                      Favorites
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {allResults.filter(r => ['2', '13', '16'].includes(r.id)).map((item) => {
                      const Icon = typeIcons[item.type];
                      const color = typeColors[item.type];
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] hover:bg-secondary rounded-lg transition-colors text-left"
                        >
                          <div
                            className="size-7 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="size-3.5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {item.name}
                            </span>
                            <span className="text-xs text-muted truncate block">{item.project}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Live results — update immediately on every keystroke */}
            {hasQuery && (
              <>
                {filteredResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted">
                    <Search className="size-10 mb-3 opacity-20" />
                    <p className="text-sm mb-1" style={{ fontWeight: 'var(--font-weight-semibold)', color: '#36415D' }}>No results found</p>
                    <p className="text-xs" style={{ color: '#868D9E' }}>Try different keywords or use voice search</p>
                    {voiceSupported && (
                      <button
                        onClick={startListening}
                        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors hover:opacity-80"
                        style={{ backgroundColor: '#F5F5F5', color: '#36415D', border: '1px solid #E9E9E9', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        <Mic className="size-3.5" style={{ color: '#8404B3' }} />
                        Search by voice
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Results count */}
                    <div className="mb-3 px-1">
                      <span className="text-xs" style={{ color: '#868D9E' }}>
                        {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                        {activeFilter !== 'all' && ` in ${filterLabels[activeFilter]}`}
                      </span>
                    </div>

                    {Object.entries(grouped).map(([group, items]) => {
                      const hasMore = items.length > maxGroupItems;
                      const displayItems = hasMore ? items.slice(0, maxGroupItems) : items;
                      return (
                        <div key={group} className="mb-4">
                          <h4 className="text-xs text-muted uppercase tracking-wider mb-1.5 px-1" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                            {group} ({items.length})
                          </h4>
                          <div className="space-y-0.5">
                            {displayItems.map((result) => {
                              const Icon = typeIcons[result.type];
                              const color = typeColors[result.type];
                              return (
                                <div
                                  key={result.id}
                                  onClick={() => handleResultClick(result)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary transition-colors group"
                                >
                                  <div
                                    className="size-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${color}15` }}
                                  >
                                    <Icon className="size-4" style={{ color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                      {result.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted truncate">
                                      <span
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
                                        style={{
                                          backgroundColor: `${color}10`,
                                          color: color,
                                          fontWeight: 'var(--font-weight-semibold)',
                                        }}
                                      >
                                        {result.project}
                                      </span>
                                      <span className="truncate">{result.path}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleContextMenuClick(e, result.id); }}
                                    className="p-1 text-muted hover:text-foreground hover:bg-secondary rounded md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0"
                                  >
                                    <MoreVertical className="size-3.5" />
                                  </button>
                                  <ChevronRight className="size-3.5 text-muted group-hover:text-foreground transition-colors shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                          {hasMore && (
                            <button className="mt-1 px-3 text-xs text-primary hover:text-primary/80 transition-colors" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              See all {items.length} results
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div
            className="shrink-0 px-4 py-2.5 flex items-center justify-between border-t border-border"
            style={{ fontSize: '11px', color: '#868D9E' }}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#F5F5F5', border: '1px solid #E9E9E9', fontFamily: 'monospace' }}>Esc</kbd>
                close
              </span>
              {hasQuery && (
                <span className="flex items-center gap-1">
                  Results update as you type
                </span>
              )}
            </div>
            {voiceSupported && (
              <span className="flex items-center gap-1">
                <Mic className="size-3" />
                Voice enabled
              </span>
            )}
          </div>

          {/* Context menu */}
          {contextMenu && (
            <div
              className="fixed z-[60] bg-card rounded-[var(--radius)] shadow-elevation-lg border border-border py-1 w-48"
              style={{ top: Math.min(contextMenu.y, window.innerHeight - 120), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
            >
              {(() => {
                const result = allResults.find(r => r.id === contextMenu.id);
                return (
                  <>
                    <button
                      onClick={() => { setContextMenu(null); if (result) handleResultClick(result); }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                    >
                      <FolderOpen className="size-4" /> Open item
                    </button>
                    <button
                      onClick={() => {
                        setContextMenu(null);
                        if (result) {
                          onClose();
                          navigate(`/app/project/${result.projectId}/kb`);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                    >
                      <ChevronRight className="size-4" /> Open item location
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
