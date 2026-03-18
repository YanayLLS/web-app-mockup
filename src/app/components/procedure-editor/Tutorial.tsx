import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface TutorialProps {
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  highlightArea?: {
    selector: string;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to the Flow Editor!',
    description: 'This quick tutorial will show you the main features. Click Next to continue or skip anytime.'
  },
  {
    title: 'Top Toolbar',
    description: 'Here\'s your editing menu. You can change step colors, create options for different paths, add informational popups, and access all settings.',
    highlightArea: {
      selector: '[data-tutorial="toolbar"]'
    }
  },
  {
    title: 'The Step Card',
    description: 'This is your main workspace. Each step contains a title, description, and options. Click the + buttons to add content, or use the toolbar icons for advanced features.',
    highlightArea: {
      selector: '[data-tutorial="step-card"]'
    }
  },
  {
    title: 'Media Viewer',
    description: 'The media viewer is always visible to the left of your step card. Drag and drop files, or click to upload images and videos. Thumbnails appear below with delete buttons when you hover.',
    highlightArea: {
      selector: '[data-tutorial="media-viewer"]'
    }
  },
  {
    title: 'Navigation Controls',
    description: 'Use Previous/Next to move between steps. When you\'re on the last step, "Next" becomes "Add step" to create a new one.',
    highlightArea: {
      selector: '[data-tutorial="controls"]'
    }
  },
  {
    title: 'You\'re All Set!',
    description: 'That\'s it! Start building your flow. Remember, you can always access this tutorial from the debug menu.'
  }
];

export function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cardPosition, setCardPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{ position: 'top' | 'bottom' | 'left' | 'right'; offset: number } | null>(null);
  const step = tutorialSteps[currentStep];

  const updatePosition = useCallback(() => {
    if (!step.highlightArea) {
      setCardPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setHighlightRect(null);
      setPointerPosition(null);
      return;
    }

    const element = document.querySelector(step.highlightArea.selector);
    if (!element) {
      // Element doesn't exist, fall back to center
      setCardPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setHighlightRect(null);
      setPointerPosition(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setHighlightRect(rect);

    const cardWidth = 400;
    const cardHeight = 260; // Increased to account for actual card height
    const gap = 24; // Gap between highlighted element and tutorial card
    const margin = 24; // Margin from viewport edges

    // Calculate available space in each direction from the highlighted element
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    // Check if card would fit in viewport at all (mobile/small screens)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const actualCardWidth = Math.min(cardWidth, viewportWidth - margin * 2);
    const actualCardHeight = cardHeight; // Height should be flexible based on content

    // Determine which direction has the most space
    const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
    
    let position: any = {};
    let pointer: { position: 'top' | 'bottom' | 'left' | 'right'; offset: number } | null = null;

    // Position in the direction with most space
    if (maxSpace === spaceBottom && spaceBottom >= cardHeight + gap) {
      // Position below the highlighted element
      const idealLeft = rect.left + rect.width / 2;
      const constrainedLeft = Math.max(
        margin + actualCardWidth / 2,
        Math.min(idealLeft, viewportWidth - actualCardWidth / 2 - margin)
      );
      
      // Calculate top position, ensuring card fits in viewport
      const topPosition = rect.bottom + gap;
      const maxTop = viewportHeight - actualCardHeight - margin;
      const finalTop = Math.max(margin, Math.min(topPosition, maxTop));
      
      position = {
        top: `${finalTop}px`,
        left: `${constrainedLeft}px`,
        transform: 'translateX(-50%)'
      };
      
      // Pointer at top of card, offset horizontally to align with element center
      const pointerOffset = ((idealLeft - constrainedLeft) / actualCardWidth) * 100;
      pointer = { position: 'top', offset: Math.max(10, Math.min(90, 50 + pointerOffset)) };
      
    } else if (maxSpace === spaceTop && spaceTop >= cardHeight + gap) {
      // Position above the highlighted element
      const idealLeft = rect.left + rect.width / 2;
      const constrainedLeft = Math.max(
        margin + actualCardWidth / 2,
        Math.min(idealLeft, viewportWidth - actualCardWidth / 2 - margin)
      );
      
      // Calculate bottom edge of card position (should be at rect.top - gap)
      // Then calculate top by subtracting card height
      const cardBottom = rect.top - gap;
      const cardTop = cardBottom - actualCardHeight;
      const minTop = margin;
      const finalTop = Math.max(minTop, cardTop);
      
      position = {
        top: `${finalTop}px`,
        left: `${constrainedLeft}px`,
        transform: 'translateX(-50%)'
      };
      
      // Pointer at bottom of card
      const pointerOffset = ((idealLeft - constrainedLeft) / actualCardWidth) * 100;
      pointer = { position: 'bottom', offset: Math.max(10, Math.min(90, 50 + pointerOffset)) };
      
    } else if (maxSpace === spaceRight && spaceRight >= actualCardWidth + gap) {
      // Position to the right of the highlighted element
      const idealTop = rect.top + rect.height / 2;
      const constrainedTop = Math.max(
        margin + actualCardHeight / 2,
        Math.min(idealTop, viewportHeight - actualCardHeight / 2 - margin)
      );
      
      // Calculate left position, ensuring card fits in viewport
      const leftPosition = rect.right + gap;
      const maxLeft = viewportWidth - actualCardWidth - margin;
      const finalLeft = Math.max(margin, Math.min(leftPosition, maxLeft));
      
      position = {
        top: `${constrainedTop}px`,
        left: `${finalLeft}px`,
        transform: 'translateY(-50%)'
      };
      
      // Pointer on left of card
      const pointerOffset = ((idealTop - constrainedTop) / actualCardHeight) * 100;
      pointer = { position: 'left', offset: Math.max(10, Math.min(90, 50 + pointerOffset)) };
      
    } else if (maxSpace === spaceLeft && spaceLeft >= actualCardWidth + gap) {
      // Position to the left of the highlighted element
      const idealTop = rect.top + rect.height / 2;
      const constrainedTop = Math.max(
        margin + actualCardHeight / 2,
        Math.min(idealTop, viewportHeight - actualCardHeight / 2 - margin)
      );
      
      // Calculate left position, ensuring card fits in viewport
      const rightPosition = rect.left - gap;
      const minLeft = margin;
      const finalLeft = Math.max(minLeft, Math.min(rightPosition - actualCardWidth, viewportWidth - actualCardWidth - margin));
      
      position = {
        top: `${constrainedTop}px`,
        left: `${finalLeft + actualCardWidth}px`,
        transform: 'translate(-100%, -50%)'
      };
      
      // Pointer on right of card
      const pointerOffset = ((idealTop - constrainedTop) / actualCardHeight) * 100;
      pointer = { position: 'right', offset: Math.max(10, Math.min(90, 50 + pointerOffset)) };
      
    } else {
      // Fallback: position card in viewport avoiding the highlighted element
      // Try to position above or below first
      if (spaceBottom > spaceTop) {
        const topPosition = Math.min(rect.bottom + gap, viewportHeight - actualCardHeight - margin);
        const leftPosition = Math.max(margin, Math.min(
          viewportWidth / 2,
          viewportWidth - actualCardWidth - margin
        ));
        position = {
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
          transform: 'translateX(-50%)'
        };
      } else {
        const topPosition = Math.max(margin, rect.top - gap - actualCardHeight);
        const leftPosition = Math.max(margin, Math.min(
          viewportWidth / 2,
          viewportWidth - actualCardWidth - margin
        ));
        position = {
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
          transform: 'translateX(-50%)'
        };
      }
      pointer = null;
    }

    setCardPosition(position);
    setPointerPosition(pointer);
  }, [step]);

  const handleNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  }, [currentStep, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    }
  }, [onClose, handleNext, handlePrevious]);

  useEffect(() => {
    // Initial position update
    updatePosition();

    // Update on resize
    const handleResize = () => {
      updatePosition();
    };

    // Re-calculate after a short delay to ensure DOM is ready
    const timeout = setTimeout(updatePosition, 100);
    const timeout2 = setTimeout(updatePosition, 300);

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [currentStep, updatePosition, handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 z-[200] pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      {/* Highlight area with stronger visuals */}
      {highlightRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute pointer-events-none rounded-lg"
          style={{
            top: `${highlightRect.top - 4}px`,
            left: `${highlightRect.left - 4}px`,
            width: `${highlightRect.width + 8}px`,
            height: `${highlightRect.height + 8}px`,
          }}
        >
          {/* Animated glow effect */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(47, 128, 237, 0.5)',
                '0 0 0 12px rgba(47, 128, 237, 0.1)',
                '0 0 0 0 rgba(47, 128, 237, 0.5)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-[3px] border-primary rounded-lg"
          />
          {/* Solid border */}
          <div className="absolute inset-0 border-[3px] border-primary rounded-lg shadow-[0_0_20px_rgba(47,128,237,0.5)]" />
        </motion.div>
      )}

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-card rounded-lg shadow-elevation-sm max-w-[400px] pointer-events-auto z-10 border border-border"
          style={cardPosition}
        >
          {/* Chat Bubble Pointer */}
          {pointerPosition && (
            <div
              className="absolute"
              style={{
                ...(pointerPosition.position === 'top' && {
                  top: '-8px',
                  left: `${pointerPosition.offset}%`,
                  transform: 'translateX(-50%)',
                }),
                ...(pointerPosition.position === 'bottom' && {
                  bottom: '-8px',
                  left: `${pointerPosition.offset}%`,
                  transform: 'translateX(-50%) rotate(180deg)',
                }),
                ...(pointerPosition.position === 'left' && {
                  left: '-8px',
                  top: `${pointerPosition.offset}%`,
                  transform: 'translateY(-50%) rotate(-90deg)',
                }),
                ...(pointerPosition.position === 'right' && {
                  right: '-8px',
                  top: `${pointerPosition.offset}%`,
                  transform: 'translateY(-50%) rotate(90deg)',
                }),
              }}
            >
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                <path
                  d="M8 0L16 8H0L8 0Z"
                  fill="var(--card)"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              </svg>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div 
                className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold"
                aria-label={`Step ${currentStep + 1} of ${tutorialSteps.length}`}
              >
                {currentStep + 1}
              </div>
              <h4 id="tutorial-title" className="text-card-foreground">
                {step.title}
              </h4>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors"
              aria-label="Close tutorial"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-card-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-secondary/30 rounded-b-lg">
            <div className="flex gap-1.5" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={tutorialSteps.length}>
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-label={index === currentStep ? 'Current step' : `Step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-1 px-3 py-1.5 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground rounded-button hover:brightness-110 transition-opacity"
                aria-label={currentStep === tutorialSteps.length - 1 ? 'Finish tutorial' : 'Next step'}
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < tutorialSteps.length - 1 && <ChevronRight className="size-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
