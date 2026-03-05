import { X, Search, Filter, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PartsCatalogPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Part {
  id: string;
  name: string;
  isExpanded?: boolean;
  isSelected?: boolean;
}

const mockParts: Part[] = [
  { id: '1', name: 'F-7.5.13-63 Pluritec EVO 2S' },
  { id: '2', name: 'F-7.5.1.3-71-2 LENZ DRILL' },
  { id: '3', name: 'F-7.5.13-13 Accuprint AP30 I-L' },
  { id: '4', name: 'F-7.5.13-49 Precious Metals E...' },
  { id: '5', name: 'F-7.5.13-01 PumiFlex SHD 20...' },
  { id: '6', name: 'F-7.5.13-74 FluoroEtch Line' },
  { id: '7', name: 'F-7.5.13-72 Micro Vu Excel 16...' },
  { id: '8', name: 'F-7.5.13-60 Plasma', isSelected: true },
  { id: '9', name: 'F-7.5.13-28 Orbotech Discovery...' },
  { id: '10', name: 'F-7.5.13-43 DNVL-1230 O-L 231' },
  { id: '11', name: 'F-7.5.13-49 Multi Station # 7' },
  { id: '12', name: 'F-7.5.13-38 Orboburr' },
  { id: '13', name: 'F-7.5.13-29 Morton Auto.Lam. 1...' },
  { id: '14', name: 'F-7.5.13-34 Stripper' },
  { id: '15', name: 'F-7.5.13-45 Reflow, ASI, Post Cle...' },
  { id: '16', name: 'F-7.5.13-62 LPISM Spray Coater...' },
  { id: '17', name: 'F-7.5.13-41 Lamination Press 1', isSelected: true },
  { id: '18', name: 'F-7.5.13-36 Developer' },
  { id: '19', name: 'F-7.5.13-72 Orbotech Nuvogo...' },
  { id: '20', name: 'F-7.5.13-27 Colight-1600 I-L' },
  { id: '21', name: 'F-7.5.13-55 Chemical Storage...' },
  { id: '22', name: 'F-7.5.13-22 Resist Stripper' }
];

export function PartsCatalogPanel({ isOpen, onClose }: PartsCatalogPanelProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'tools'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParts, setSelectedParts] = useState<Set<string>>(
    new Set(mockParts.filter(p => p.isSelected).map(p => p.id))
  );
  const [visibleParts, setVisibleParts] = useState<Set<string>>(
    new Set(mockParts.map(p => p.id))
  );

  const filteredParts = mockParts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePart = (id: string) => {
    const newSelected = new Set(selectedParts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParts(newSelected);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Sliding Panel Container with Padding */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[320px] z-[61] flex flex-col p-3"
          >
            {/* Inner Panel with Background, Shadow, and Rounded Corners */}
            <div className="bg-card shadow-[0px_2px_9px_0px_rgba(0,0,0,0.55)] flex flex-col h-full" style={{ borderRadius: 'var(--radius)' }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sidebar-border" style={{ 
              padding: 'var(--spacing-lg)',
              borderTopLeftRadius: 'var(--radius)', 
              borderTopRightRadius: 'var(--radius)' 
            }}>
              <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
                <p className="text-foreground font-semibold" style={{ 
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-base)'
                }}>
                  {activeTab === 'catalog' ? 'Parts catalog' : 'Tools'}
                </p>
                <div className="bg-sidebar-border h-[24px] w-px" />
                <button
                  onClick={() => setActiveTab(activeTab === 'catalog' ? 'tools' : 'catalog')}
                  className="text-foreground hover:text-primary transition-colors"
                  style={{ 
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  {activeTab === 'catalog' ? 'Tools' : 'Parts catalog'}
                </button>
              </div>
              <button onClick={onClose} className="text-muted hover:text-foreground p-1 transition-colors">
                <X className="size-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-border" style={{ padding: 'var(--spacing-lg)' }}>
              <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for part..."
                    className="w-full bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    style={{ 
                      borderRadius: 'var(--radius-button)',
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      paddingRight: '40px',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)'
                    }}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-foreground" />
                </div>
                <button className="p-2 hover:bg-background rounded-full transition-colors">
                  <Filter className="size-4 text-foreground" />
                </button>
              </div>
            </div>

            {/* Parts List */}
            <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {filteredParts.map((part) => (
                  <div
                    key={part.id}
                    className={`flex items-center cursor-pointer transition-colors ${
                      selectedParts.has(part.id)
                        ? 'bg-secondary'
                        : 'hover:bg-background'
                    }`}
                    style={{
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-button)'
                    }}
                    onClick={() => togglePart(part.id)}
                  >
                    <ChevronRight className="size-3 text-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate bg-secondary" style={{ 
                        borderRadius: 'var(--radius-button)',
                        padding: 'var(--spacing-xs) var(--spacing-md)',
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)'
                      }}>
                        {part.name}
                      </p>
                    </div>
                    <button 
                      className="p-1 hover:bg-card/50 rounded flex-shrink-0 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Search className="size-3 text-foreground" />
                    </button>
                    <button 
                      className="p-1 hover:bg-card/50 rounded flex-shrink-0 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisibleParts(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(part.id)) {
                            newSet.delete(part.id);
                          } else {
                            newSet.add(part.id);
                          }
                          return newSet;
                        });
                      }}
                    >
                      {visibleParts.has(part.id) ? (
                        <Eye className="size-3 text-foreground" />
                      ) : (
                        <EyeOff className="size-3 text-foreground" />
                      )}
                    </button>
                    <button 
                      className="p-1 hover:bg-card/50 rounded flex-shrink-0 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <svg className="size-3 text-foreground" fill="none" viewBox="0 0 16 18">
                        <path
                          clipRule="evenodd"
                          d="M8 0C7.72 0 7.47 0.15 7.34 0.39L0.34 13.39C0.21 13.63 0.21 13.92 0.35 14.16C0.49 14.4 0.74 14.55 1.01 14.55H14.99C15.26 14.55 15.51 14.4 15.65 14.16C15.79 13.92 15.79 13.63 15.66 13.39L8.66 0.39C8.53 0.15 8.28 0 8 0ZM8 4.5C7.45 4.5 7 4.95 7 5.5V9.5C7 10.05 7.45 10.5 8 10.5C8.55 10.5 9 10.05 9 9.5V5.5C9 4.95 8.55 4.5 8 4.5ZM8 12C7.45 12 7 12.45 7 13C7 13.55 7.45 14 8 14C8.55 14 9 13.55 9 13C9 12.45 8.55 12 8 12Z"
                          fill="currentColor"
                          fillRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-background" style={{ 
              padding: 'var(--spacing-lg)',
              borderBottomLeftRadius: 'var(--radius)', 
              borderBottomRightRadius: 'var(--radius)' 
            }}>
              <div className="flex justify-between text-foreground" style={{ 
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--spacing-sm)' 
              }}>
                <span>Total Parts</span>
                <span className="font-semibold">{filteredParts.length}</span>
              </div>
              <div className="flex justify-between text-foreground" style={{ 
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)' 
              }}>
                <span>Selected Parts</span>
                <span className="font-semibold">{selectedParts.size}</span>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
