import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Checkbox } from './Checkbox';

interface MultiSelectFilterModalProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onClose: () => void;
  onApply: (items: string[]) => void;
}

export function MultiSelectFilterModal({
  title,
  items,
  selectedItems,
  onClose,
  onApply,
}: MultiSelectFilterModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedItems);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === filteredItems.length) {
      setSelected([]);
    } else {
      setSelected(filteredItems);
    }
  };

  const handleClear = () => {
    setSelected([]);
  };

  const handleApply = () => {
    onApply(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-elevation-sm w-full max-w-[400px] max-h-[600px] flex flex-col"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div
            className="h-[42px] relative rounded-lg"
            style={{ backgroundColor: 'var(--input-background)' }}
          >
            <div className="flex items-center gap-2 px-3 py-2 h-full">
              <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute border border-solid inset-0 pointer-events-none rounded-lg"
              style={{ borderColor: 'var(--ring)' }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleSelectAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              {selected.length === filteredItems.length ? 'Deselect All' : 'Select All'}
            </button>
            {selected.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs hover:underline"
                style={{ color: 'var(--muted)' }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {filteredItems.map((item) => {
              const isSelected = selected.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => handleToggle(item)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:bg-secondary'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); handleToggle(item); }}
                  />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                No items found
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {selected.length} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
