import { X, Search, Filter, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PartsCatalogModalProps {
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

export function PartsCatalogModal({ onClose }: PartsCatalogModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg w-full max-w-[min(303px,calc(100vw-32px))] shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#c2c9db]">
          <div className="flex items-center gap-3">
            <p className="text-[#36415d] font-['Open_Sans:Regular',sans-serif] text-[12px]">
              {activeTab === 'catalog' ? 'Parts catalog' : 'Tools'}
            </p>
            <div className="bg-[#c2c9db] h-[20px] w-px" />
            <button
              onClick={() => setActiveTab(activeTab === 'catalog' ? 'tools' : 'catalog')}
              className="text-[#36415d] font-['Open_Sans:Regular',sans-serif] text-[12px] hover:text-[#2f80ed]"
            >
              {activeTab === 'catalog' ? 'Tools' : 'Parts catalog'}
            </button>
          </div>
          <button onClick={onClose} className="text-[#7f7f7f] hover:text-[#36415d] min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for part..."
                className="w-full bg-[#c2c9db] rounded-full px-3 py-2 pr-8 min-h-[44px] text-[12px] text-[#36415d] outline-none focus:ring-2 focus:ring-[#2f80ed]"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-[#36415d]" />
            </div>
            <button className="p-2 hover:bg-[#f5f5f5] rounded min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Filter className="size-4 text-[#36415d]" />
            </button>
          </div>
        </div>

        {/* Parts List */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            {filteredParts.map((part) => (
              <div
                key={part.id}
                className={`flex items-center gap-2 px-2 py-2 min-h-[44px] rounded-full cursor-pointer transition-colors ${
                  selectedParts.has(part.id)
                    ? 'bg-[#e9e9e9]'
                    : 'hover:bg-[#f5f5f5]'
                }`}
                onClick={() => togglePart(part.id)}
              >
                <ChevronRight className="size-3 text-[#36415d] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#36415d] text-[12px] truncate bg-[#e9e9e9] rounded-full px-3 py-1">
                    {part.name}
                  </p>
                </div>
                <button className="p-1 hover:bg-white/50 rounded flex-shrink-0">
                  <Search className="size-3 text-[#36415d]" />
                </button>
                <button 
                  className="p-1 hover:bg-white/50 rounded flex-shrink-0"
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
                    <Eye className="size-3 text-[#36415d]" />
                  ) : (
                    <EyeOff className="size-3 text-[#36415d]" />
                  )}
                </button>
                <button className="p-1 hover:bg-white/50 rounded flex-shrink-0">
                  <svg className="size-3 text-[#36415d]" fill="none" viewBox="0 0 16 18">
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
        <div className="border-t border-[#c2c9db] p-3">
          <div className="flex justify-between text-[#36415d] text-[10px]">
            <span>Total Parts</span>
            <span className="font-semibold">{filteredParts.length}</span>
          </div>
          <div className="flex justify-between text-[#36415d] text-[10px] mt-1">
            <span>Selected Parts</span>
            <span className="font-semibold">{selectedParts.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
