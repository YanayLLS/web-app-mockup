import { X } from 'lucide-react';
import { useState } from 'react';

interface DefineStepModalProps {
  onConfirm: (stepData: { title?: string; description?: string; color: string }) => void;
  onClose: () => void;
  actionName?: string;
}

const colorOptions = [
  { name: 'Default', color: '#36415d' },
  { name: 'Blue', color: '#2f80ed' },
  { name: 'Green', color: '#27ae60' },
  { name: 'Red', color: '#eb5757' },
  { name: 'Purple', color: '#9b51e0' },
  { name: 'Orange', color: '#f2994a' },
];

export function DefineStepModal({ onConfirm, onClose, actionName }: DefineStepModalProps) {
  const [title, setTitle] = useState(actionName ? `Step: ${actionName}` : '');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#36415d');

  const handleConfirm = () => {
    onConfirm({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      color: selectedColor
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-[rgba(0,0,0,0.95)] border border-[#36415d] rounded-lg w-full max-w-[min(500px,calc(100vw-32px))] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#36415d]">
          <h3 className="text-white font-['Open_Sans:Bold',sans-serif] text-[16px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            {actionName ? `Define Step for "${actionName}"` : 'Define New Step'}
          </h3>
          <button onClick={onClose} className="text-white hover:opacity-70 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white text-[12px] mb-2 font-['Open_Sans:Bold',sans-serif]">
              Step Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter step title..."
              className="w-full bg-[rgba(255,255,255,0.1)] text-white border border-[#36415d] rounded-lg px-4 py-3 min-h-[44px] text-[14px] outline-none focus:border-white transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-[12px] mb-2 font-['Open_Sans:Bold',sans-serif]">
              Step Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter step description..."
              className="w-full bg-[rgba(255,255,255,0.1)] text-white border border-[#36415d] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-white transition-colors resize-none"
              rows={3}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-white text-[12px] mb-2 font-['Open_Sans:Bold',sans-serif]">
              Step Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.color}
                  onClick={() => setSelectedColor(option.color)}
                  className={`flex items-center gap-3 p-3 min-h-[44px] rounded-lg border-2 transition-all ${
                    selectedColor === option.color
                      ? 'border-white bg-[rgba(255,255,255,0.1)]'
                      : 'border-[#36415d] hover:border-white/50'
                  }`}
                >
                  <div
                    className="size-6 rounded-full border-2 border-white shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="text-white text-[12px]">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-[rgba(255,255,255,0.05)] border border-[#36415d] rounded-lg">
            <p className="text-white/50 text-[10px] mb-2">Preview:</p>
            <div 
              className="p-3 rounded-lg border-2"
              style={{ borderColor: selectedColor }}
            >
              {title && (
                <p className="text-white font-['Open_Sans:Bold',sans-serif] text-[14px] mb-1">
                  {title}
                </p>
              )}
              {description && (
                <p className="text-white/80 text-[12px]">
                  {description}
                </p>
              )}
              {!title && !description && (
                <p className="text-white/30 text-[12px] italic">
                  Empty step (you can add content later)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 sm:px-6 py-4 border-t border-[#36415d]">
          <button
            onClick={onClose}
            className="bg-[rgba(255,255,255,0.1)] text-white px-6 py-2 min-h-[44px] rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-[#2f80ed] text-white px-6 py-2 min-h-[44px] rounded-lg hover:bg-[#2570d0] transition-colors"
          >
            Create Step
          </button>
        </div>
      </div>
    </div>
  );
}
