import { useState, useMemo, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { BaseModal } from '../../modals/BaseModal';
import { Checkbox } from '../../modals/Checkbox';
import { SUPPORTED_LANGUAGES } from './languageConstants';

interface AddLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLanguages: string[];
  onAdd: (codes: string[], copyFromDefault: boolean) => void;
}

export function AddLanguageModal({ isOpen, onClose, existingLanguages, onAdd }: AddLanguageModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copyFromDefault, setCopyFromDefault] = useState(true);
  const lastClickedIndexRef = useRef<number | null>(null);

  const available = useMemo(() => {
    const existing = new Set(existingLanguages);
    return SUPPORTED_LANGUAGES.filter((l) => !existing.has(l.code));
  }, [existingLanguages]);

  const filtered = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [available, search]);

  // Select All logic: all filtered items are selected
  const allFilteredSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.code));
  const someFilteredSelected = filtered.some((l) => selected.has(l.code));
  const selectAllIndeterminate = someFilteredSelected && !allFilteredSelected;

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        // Deselect all filtered
        filtered.forEach((l) => next.delete(l.code));
      } else {
        // Select all filtered
        filtered.forEach((l) => next.add(l.code));
      }
      return next;
    });
    lastClickedIndexRef.current = null;
  }, [allFilteredSelected, filtered]);

  const handleItemClick = useCallback(
    (index: number, code: string, event: React.MouseEvent) => {
      if (event.shiftKey && lastClickedIndexRef.current !== null) {
        // Shift+click range selection
        const start = Math.min(lastClickedIndexRef.current, index);
        const end = Math.max(lastClickedIndexRef.current, index);
        setSelected((prev) => {
          const next = new Set(prev);
          for (let i = start; i <= end; i++) {
            next.add(filtered[i].code);
          }
          return next;
        });
      } else {
        // Normal toggle
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(code)) next.delete(code);
          else next.add(code);
          return next;
        });
      }
      lastClickedIndexRef.current = index;
    },
    [filtered]
  );

  const handleAdd = () => {
    if (selected.size === 0) return;
    onAdd(Array.from(selected), copyFromDefault);
    setSelected(new Set());
    setSearch('');
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={60}>
      <div
        className="rounded-xl flex flex-col"
        style={{
          width: '480px',
          maxHeight: '70vh',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Add Languages
          </h3>
          <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
            Select languages to add to this procedure. Hold Shift to select a range.
          </p>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full text-xs border rounded pl-8 pr-3 py-2 focus:outline-none"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Select All */}
        {filtered.length > 0 && (
          <div
            className="px-5 py-2.5 border-b flex items-center gap-2 cursor-pointer select-none shrink-0"
            style={{ borderColor: 'var(--border)' }}
            onClick={toggleSelectAll}
          >
            <Checkbox
              checked={allFilteredSelected}
              indeterminate={selectAllIndeterminate}
              onChange={toggleSelectAll}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              Select All
            </span>
            <span
              className="text-[10px] ml-auto"
              style={{ color: 'var(--muted)' }}
            >
              {filtered.length} language{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Language list */}
        <div className="overflow-y-auto custom-scrollbar px-4 py-3 flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {available.length === 0 ? 'All supported languages have been added.' : 'No languages match your search.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filtered.map((lang, index) => {
                const isSelected = selected.has(lang.code);
                return (
                  <div
                    key={lang.code}
                    onClick={(e) => handleItemClick(index, lang.code, e)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all select-none"
                    style={{
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'rgba(47, 128, 237, 0.06)' : 'var(--card)',
                      // Offset the extra 0.5px border so cards don't shift when selected
                      margin: isSelected ? '0' : '0.25px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(lang.code)) next.delete(lang.code);
                          else next.add(lang.code);
                          return next;
                        });
                        lastClickedIndexRef.current = index;
                      }}
                    />
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                        {lang.name}
                      </span>
                      <span className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        {lang.nativeName}
                      </span>
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: 'var(--muted)' }}
                    >
                      {lang.code}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Copy from default checkbox */}
        <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div
            onClick={() => setCopyFromDefault(!copyFromDefault)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox checked={copyFromDefault} onChange={() => setCopyFromDefault(!copyFromDefault)} />
            <span className="text-xs" style={{ color: 'var(--foreground)' }}>
              Copy text from default language
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end gap-2 shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-medium border hover:bg-secondary transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="px-4 py-2 rounded text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selected.size > 0 ? 'var(--primary)' : 'var(--secondary)',
              color: selected.size > 0 ? 'white' : 'var(--muted)',
            }}
          >
            Add {selected.size > 0 ? `${selected.size} Language${selected.size > 1 ? 's' : ''}` : 'Languages'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
