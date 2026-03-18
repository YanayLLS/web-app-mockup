import { useState } from 'react';
import { X, ChevronDown, Settings, Save, Clock, BarChart3, Tag } from 'lucide-react';

interface ProcedureSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedureName: string;
}

const difficultyColors: Record<string, { color: string; bg: string }> = {
  'Beginner': { color: '#11E874', bg: 'rgba(17,232,116,0.1)' },
  'Intermediate': { color: '#2F80ED', bg: 'rgba(47,128,237,0.1)' },
  'Advanced': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  'Expert': { color: '#FF1F1F', bg: 'rgba(255,31,31,0.1)' },
};

export function ProcedureSettingsModal({ isOpen, onClose, procedureName }: ProcedureSettingsModalProps) {
  const [name, setName] = useState(procedureName);
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('30');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [category, setCategory] = useState('Maintenance');
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  if (!isOpen) return null;

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const categories = ['Maintenance', 'Assembly', 'Repair', 'Inspection', 'Training', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="procedure-settings-title"
        className="bg-card border border-border rounded-xl max-w-[560px] w-full mx-4 max-h-[90vh] overflow-auto"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border/60 sticky top-0 z-10 bg-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Settings size={20} />
            </div>
            <div>
              <h2 id="procedure-settings-title" className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
                Flow Settings
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Configure settings for this flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Procedure Name */}
          <div>
            <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Flow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Description <span className="text-muted" style={{ fontWeight: 'var(--font-weight-normal)', fontSize: 'var(--text-xs)' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all resize-none placeholder:text-muted"
              placeholder="Add a description for this flow..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Time */}
            <div>
              <label className="block text-sm text-foreground mb-2 flex items-center gap-1.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                <Clock size={13} className="text-muted" />
                Est. Time (min)
              </label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all"
              />
            </div>

            {/* Difficulty */}
            <div className="relative">
              <label className="block text-sm text-foreground mb-2 flex items-center gap-1.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                <BarChart3 size={13} className="text-muted" />
                Difficulty
              </label>
              <button
                onClick={() => { setShowDifficultyMenu(!showDifficultyMenu); setShowCategoryMenu(false); }}
                className="w-full px-3 py-2.5 text-sm text-left bg-card border border-border rounded-lg text-foreground flex items-center justify-between hover:border-primary/20 hover:bg-secondary/30 transition-all"
                style={{ fontWeight: 'var(--font-weight-medium)' }}
                aria-haspopup="listbox"
                aria-expanded={showDifficultyMenu}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: difficultyColors[difficulty]?.color }}
                  />
                  {difficulty}
                </div>
                <ChevronDown size={14} className={`text-muted transition-transform ${showDifficultyMenu ? 'rotate-180' : ''}`} />
              </button>
              {showDifficultyMenu && (
                <div
                  className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl z-20 overflow-hidden p-1"
                  style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                >
                  {difficulties.map((diff) => {
                    const dc = difficultyColors[diff];
                    return (
                      <button
                        key={diff}
                        onClick={() => {
                          setDifficulty(diff);
                          setShowDifficultyMenu(false);
                        }}
                        className={`w-full px-3 py-2.5 text-sm text-left rounded-lg transition-all flex items-center gap-2.5 ${
                          difficulty === diff ? 'bg-primary/[0.06]' : 'hover:bg-secondary'
                        }`}
                        style={{ fontWeight: difficulty === diff ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dc.color, boxShadow: `0 0 6px ${dc.color}40` }}
                        />
                        <span className={difficulty === diff ? 'text-primary' : 'text-foreground'}>{diff}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm text-foreground mb-2 flex items-center gap-1.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              <Tag size={13} className="text-muted" />
              Category
            </label>
            <button
              onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowDifficultyMenu(false); }}
              className="w-full px-3 py-2.5 text-sm text-left bg-card border border-border rounded-lg text-foreground flex items-center justify-between hover:border-primary/20 hover:bg-secondary/30 transition-all"
              style={{ fontWeight: 'var(--font-weight-medium)' }}
              aria-haspopup="listbox"
              aria-expanded={showCategoryMenu}
            >
              {category}
              <ChevronDown size={14} className={`text-muted transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryMenu && (
              <div
                className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl z-20 overflow-hidden p-1"
                style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full px-3 py-2.5 text-sm text-left rounded-lg transition-all ${
                      category === cat ? 'bg-primary/[0.06] text-primary' : 'text-foreground hover:bg-secondary'
                    }`}
                    style={{ fontWeight: category === cat ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60 bg-secondary/5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-foreground bg-card border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
