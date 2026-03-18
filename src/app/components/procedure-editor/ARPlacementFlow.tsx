import { useState, useEffect } from 'react';
import { ArrowLeft, Scan, Hand, QrCode } from 'lucide-react';

export type PlacementMethod = 'object-targeting' | 'touch-to-place' | 'qr';
export type FlowScreen = 
  | 'method-selection'
  | 'target-selection'
  | 'object-alignment'
  | 'qr-scanning'
  | 'manual-placement'
  | 'correction';

export interface ObjectTarget {
  id: string;
  name: string;
  previewUrl?: string; // Preview image URL for the target
  subTargets?: ObjectTarget[];
}

interface ARPlacementFlowProps {
  onComplete: (method: PlacementMethod) => void;
  onCancel?: () => void;
  availableTargets?: ObjectTarget[];
}

export function ARPlacementFlow({ 
  onComplete,
  onCancel,
  availableTargets = []
}: ARPlacementFlowProps) {
  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<PlacementMethod | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<ObjectTarget | null>(null);

  const handleMethodSelect = (method: PlacementMethod) => {
    setSelectedMethod(method);
    
    if (method === 'touch-to-place') {
      // Manual placement goes directly to placement screen
      setCurrentScreen('manual-placement');
    } else if (method === 'object-targeting' || method === 'qr') {
      // Both object targeting and QR need target selection
      setCurrentScreen('target-selection');
    }
  };

  const handleTargetContinue = () => {
    if (!selectedMethod) return;
    
    if (selectedMethod === 'object-targeting') {
      setCurrentScreen('object-alignment');
    } else if (selectedMethod === 'qr') {
      setCurrentScreen('qr-scanning');
    }
  };

  const handleAlignmentConfirm = () => {
    setCurrentScreen('correction');
  };

  const handleQRScanned = () => {
    setCurrentScreen('correction');
  };

  const handleManualPlacementDone = () => {
    // Manual placement completes without correction step
    if (selectedMethod) {
      onComplete(selectedMethod);
    }
  };

  const handleCorrectionDone = () => {
    // Object targeting and QR complete after correction
    if (selectedMethod) {
      onComplete(selectedMethod);
    }
  };

  const handleBack = () => {
    if (currentScreen === 'target-selection') {
      setCurrentScreen('method-selection');
      setSelectedTarget(null);
    } else if (currentScreen === 'object-alignment' || currentScreen === 'qr-scanning') {
      setCurrentScreen('target-selection');
    } else if (currentScreen === 'correction') {
      if (selectedMethod === 'object-targeting') {
        setCurrentScreen('object-alignment');
      } else if (selectedMethod === 'qr') {
        setCurrentScreen('qr-scanning');
      }
    }
  };

  const showBackButton = currentScreen !== 'method-selection';

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1764114441123-586d13fc6ece?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmFjdG9yeSUyMGZsb29yJTIwY2FtZXJhJTIwdmlld3xlbnwxfHx8fDE3NzA4MTUwNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: currentScreen === 'method-selection' || currentScreen === 'target-selection' ? '0' : 'var(--spacing-lg)'
      }}
    >
      {/* Back button - positioned at top */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center self-start transition-opacity hover:opacity-70 absolute top-4 left-4 z-10"
          style={{ 
            gap: 'var(--spacing-xs)',
            color: 'white',
            fontSize: 'var(--text-base)',
            
            fontWeight: 'var(--font-weight-bold)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius)',
            border: 'none'
          }}
        >
          <ArrowLeft className="size-5" />
          Back
        </button>
      )}

      {/* Content container */}
      <div className="flex-1 flex items-stretch justify-center overflow-hidden">
        <div 
          className="w-full flex flex-col"
          style={{ 
            backgroundColor: currentScreen === 'method-selection' || currentScreen === 'target-selection' ? 'white' : 'transparent',
            maxWidth: currentScreen === 'method-selection' || currentScreen === 'target-selection' ? '800px' : 'none',
            margin: currentScreen === 'method-selection' || currentScreen === 'target-selection' ? '0 auto' : '0'
          }}
        >
          {/* Method Selection Screen */}
          {currentScreen === 'method-selection' && (
            <MethodSelectionScreen 
              onSelect={handleMethodSelect}
              onCancel={onCancel}
            />
          )}

          {/* Target Selection Screen (for Object Targeting and QR) */}
          {currentScreen === 'target-selection' && selectedMethod && (
            <TargetSelectionScreen
              method={selectedMethod}
              targets={availableTargets}
              selectedTarget={selectedTarget}
              onTargetSelect={setSelectedTarget}
              onContinue={handleTargetContinue}
            />
          )}

          {/* Object Alignment Screen */}
          {currentScreen === 'object-alignment' && (
            <ObjectAlignmentScreen onConfirm={handleAlignmentConfirm} />
          )}

          {/* QR Scanning Screen */}
          {currentScreen === 'qr-scanning' && (
            <QRScanningScreen onScanned={handleQRScanned} />
          )}

          {/* Manual Placement Screen */}
          {currentScreen === 'manual-placement' && (
            <ManualPlacementScreen onDone={handleManualPlacementDone} />
          )}

          {/* Correction Screen */}
          {currentScreen === 'correction' && (
            <CorrectionScreen onDone={handleCorrectionDone} />
          )}
        </div>
      </div>
    </div>
  );
}

// Method Selection Screen Component
function MethodSelectionScreen({ 
  onSelect, 
  onCancel 
}: { 
  onSelect: (method: PlacementMethod) => void;
  onCancel?: () => void;
}) {
  return (
    <div 
      className="flex flex-col h-full justify-center" 
      style={{ 
        gap: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)'
      }}
    >
      <h2 
        style={{ 
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          
          color: 'var(--foreground)',
          margin: 0,
          textAlign: 'center'
        }}
      >
        Select a placing method
      </h2>

      <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
        <MethodOption
          title="Object targeting"
          description="Match the shape on your screen to the physical twin."
          icon={<Scan className="size-6" />}
          onClick={() => onSelect('object-targeting')}
        />

        <MethodOption
          title="Touch to place"
          description="Place manually on scanned floors."
          icon={<Hand className="size-6" />}
          onClick={() => onSelect('touch-to-place')}
        />

        <MethodOption
          title="QR"
          description="Scan a QR code to automatically place your digital twin."
          icon={<QrCode className="size-6" />}
          onClick={() => onSelect('qr')}
        />
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full transition-all hover:brightness-95"
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'transparent',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-bold)',
            
            color: 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function MethodOption({ 
  title, 
  description, 
  icon,
  onClick 
}: { 
  title: string; 
  description: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start text-left w-full transition-all hover:brightness-110"
      style={{
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--card)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius)',
        gap: 'var(--spacing-md)',
        boxShadow: 'var(--elevation-sm)'
      }}
    >
      {icon && (
        <div 
          style={{ 
            color: 'var(--primary)',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
        <span
          style={{
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--font-weight-bold)',
            
            color: 'var(--foreground)'
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-normal)',
            
            color: 'var(--muted-foreground)'
          }}
        >
          {description}
        </span>
      </div>
    </button>
  );
}

// Target Selection Screen Component
function TargetSelectionScreen({
  method,
  targets,
  selectedTarget,
  onTargetSelect,
  onContinue
}: {
  method: PlacementMethod;
  targets: ObjectTarget[];
  selectedTarget: ObjectTarget | null;
  onTargetSelect: (target: ObjectTarget) => void;
  onContinue: () => void;
}) {
  const isQRMethod = method === 'qr';
  
  // Separate targets into non-sub-targets and sub-targets
  const nonSubTargets: ObjectTarget[] = [];
  const allSubTargets: ObjectTarget[] = [];
  
  targets.forEach(target => {
    if (!target.subTargets || target.subTargets.length === 0) {
      nonSubTargets.push(target);
    } else {
      nonSubTargets.push(target);
      allSubTargets.push(...target.subTargets);
    }
  });
  
  return (
    <div 
      className="flex flex-col h-full" 
      style={{ 
        gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg)'
      }}
    >
      <div>
        <h2 
          style={{ 
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--font-weight-bold)',
            
            color: 'var(--foreground)',
            margin: 0,
            marginBottom: 'var(--spacing-sm)',
            textAlign: 'center'
          }}
        >
          Select a target
        </h2>
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-normal)',
            
            color: 'var(--muted-foreground)',
            margin: 0,
            textAlign: 'center'
          }}
        >
          {isQRMethod 
            ? 'Scan a QR code to automatically place your digital twin.'
            : 'Choose the object target that matches your physical equipment.'}
        </p>
      </div>

      {/* Target selector - Scrollable list */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ 
          minHeight: 0,
          paddingBottom: 'var(--spacing-md)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          .flex-1.overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex flex-col" style={{ gap: 'var(--spacing-lg)' }}>
          {targets.length === 0 ? (
            <div 
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                fontSize: 'var(--text-base)',
                
                color: 'var(--muted-foreground)',
                boxShadow: 'var(--elevation-sm)'
              }}
            >
              No targets available
            </div>
          ) : (
            <>
              {/* Sub-targets section - At top */}
              {allSubTargets.length > 0 && (
                <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
                  {/* Sub-targets label */}
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--muted-foreground)',
                      paddingLeft: 'var(--spacing-md)'
                    }}
                  >
                    Attach to place option
                  </div>
                  
                  {allSubTargets.map((subTarget) => (
                    <button
                      key={subTarget.id}
                      onClick={() => onTargetSelect(subTarget)}
                      className="w-full text-left transition-all hover:brightness-110"
                      style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: selectedTarget?.id === subTarget.id ? 'var(--primary)' : 'var(--card)',
                        color: selectedTarget?.id === subTarget.id ? 'var(--primary-foreground)' : 'var(--foreground)',
                        border: selectedTarget?.id === subTarget.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        
                        fontWeight: 'var(--font-weight-bold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        minHeight: '90px'
                      }}
                    >
                      {/* Preview image for sub-target */}
                      {subTarget.previewUrl && (
                        <div 
                          style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: 'var(--radius)',
                            backgroundColor: selectedTarget?.id === subTarget.id ? 'rgba(255, 255, 255, 0.1)' : 'var(--background)',
                            flexShrink: 0,
                            overflow: 'hidden',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <img 
                            src={subTarget.previewUrl} 
                            alt={subTarget.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      )}
                      
                      <span>{subTarget.name}</span>
                    </button>
                  ))}
                </div>
              )}
            
              {/* Non-sub-targets section - At bottom */}
              {nonSubTargets.length > 0 && (
                <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
                  {nonSubTargets.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => onTargetSelect(target)}
                      className="w-full text-left transition-all hover:brightness-110"
                      style={{
                        padding: 'var(--spacing-xl)',
                        backgroundColor: selectedTarget?.id === target.id ? 'var(--primary)' : 'var(--card)',
                        color: selectedTarget?.id === target.id ? 'var(--primary-foreground)' : 'var(--foreground)',
                        border: selectedTarget?.id === target.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-lg)',
                        
                        fontWeight: 'var(--font-weight-bold)',
                        boxShadow: 'var(--elevation-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-lg)',
                        minHeight: '120px'
                      }}
                    >
                      {/* Preview image - larger */}
                      {target.previewUrl && (
                        <div 
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: 'var(--radius)',
                            backgroundColor: selectedTarget?.id === target.id ? 'rgba(255, 255, 255, 0.1)' : 'var(--background)',
                            flexShrink: 0,
                            overflow: 'hidden',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <img 
                            src={target.previewUrl} 
                            alt={target.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      )}
                      
                      <span>{target.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action button - Fixed at bottom */}
      <button
        onClick={onContinue}
        disabled={!selectedTarget}
        className="w-full transition-opacity disabled:opacity-50"
        style={{
          padding: 'var(--spacing-xl)',
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          border: 'none',
          borderRadius: 'var(--radius-button)',
          fontSize: 'var(--text-lg)',
          
          fontWeight: 'var(--font-weight-bold)',
          cursor: selectedTarget ? 'pointer' : 'not-allowed',
          boxShadow: 'var(--elevation-md)'
        }}
      >
        Continue
      </button>
    </div>
  );
}

// Object Alignment Screen Component
function ObjectAlignmentScreen({ 
  onConfirm
}: { 
  onConfirm: () => void;
}) {
  const [matchProgress, setMatchProgress] = useState(0);

  // Simulate matching progress
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 8, 100);
        
        // Auto-confirm when reaching 100%
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onConfirm();
          }, 300); // Small delay for visual feedback
        }
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onConfirm]);

  const handleReset = () => {
    setMatchProgress(0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Camera view - takes up most of the screen */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{
          overflow: 'hidden'
        }}
      >
        {/* Alignment overlay */}
        <div className="relative z-10 flex flex-col items-center" style={{ gap: 'var(--spacing-md)' }}>
          <div 
            style={{
              width: '300px',
              height: '300px',
              border: `3px dashed ${matchProgress >= 100 ? 'var(--success)' : 'var(--primary)'}`,
              borderRadius: 'var(--radius)',
              opacity: 0.8,
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Bottom panel with step card styling - padded from edges */}
      <div 
        className="flex flex-col"
        style={{
          padding: 'var(--spacing-lg)'
        }}
      >
        <div className="bg-[rgba(0,0,0,0.5)] relative rounded-[10px]">
          <div aria-hidden="true" className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[10px]" />
          <div 
            className="flex flex-col"
            style={{
              padding: 'var(--spacing-lg)',
              gap: 'var(--spacing-md)'
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                
                color: 'white',
                textAlign: 'center',
                margin: 0
              }}
            >
              Match the shape on your screen to the real object.
            </p>

            {/* Progress Bar */}
            <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
              <div className="flex justify-between items-center">
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-normal)',
                    
                    color: 'white'
                  }}
                >
                  Match Progress
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    
                    color: 'white'
                  }}
                >
                  {Math.round(matchProgress)}%
                </span>
              </div>
              
              {/* Progress bar container */}
              <div 
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden'
                }}
              >
                {/* Progress bar fill */}
                <div
                  style={{
                    height: '100%',
                    width: `${matchProgress}%`,
                    backgroundColor: matchProgress >= 100 ? 'var(--success)' : 'var(--primary)',
                    transition: 'all 0.2s ease-out',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
              {/* Reset button */}
              <button
                onClick={handleReset}
                className="transition-opacity hover:opacity-80"
                style={{
                  flex: '0 0 auto',
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-base)',
                  
                  fontWeight: 'var(--font-weight-bold)',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
              
              {/* Confirm button */}
              <button
                onClick={onConfirm}
                className="transition-opacity hover:opacity-80"
                style={{
                  flex: 1,
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-base)',
                  
                  fontWeight: 'var(--font-weight-bold)',
                  boxShadow: 'var(--elevation-md)',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// QR Scanning Screen Component
function QRScanningScreen({ 
  onScanned
}: { 
  onScanned: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Camera view - takes up most of the screen */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{
          overflow: 'hidden'
        }}
      >
        {/* QR scan frame */}
        <div className="relative z-10">
          <div 
            style={{
              width: '250px',
              height: '250px',
              border: '3px solid var(--accent)',
              borderRadius: 'var(--radius)',
              position: 'relative'
            }}
          >
            {/* Corner markers */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: '40px',
              height: '40px',
              borderTop: '5px solid var(--accent)',
              borderLeft: '5px solid var(--accent)'
            }} />
            <div style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '40px',
              height: '40px',
              borderTop: '5px solid var(--accent)',
              borderRight: '5px solid var(--accent)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-3px',
              left: '-3px',
              width: '40px',
              height: '40px',
              borderBottom: '5px solid var(--accent)',
              borderLeft: '5px solid var(--accent)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '40px',
              height: '40px',
              borderBottom: '5px solid var(--accent)',
              borderRight: '5px solid var(--accent)'
            }} />
          </div>
        </div>
      </div>

      {/* Bottom panel with step card styling - padded from edges */}
      <div 
        className="flex flex-col"
        style={{
          padding: 'var(--spacing-lg)'
        }}
      >
        <div className="bg-[rgba(0,0,0,0.5)] relative rounded-[10px]">
          <div aria-hidden="true" className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[10px]" />
          <div 
            className="flex flex-col"
            style={{
              padding: 'var(--spacing-lg)',
              gap: 'var(--spacing-md)'
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                
                color: 'white',
                textAlign: 'center',
                margin: 0
              }}
            >
              Scan a QR code to place the digital twin over it.
            </p>

            {/* Action button */}
            <button
              onClick={onScanned}
              className="w-full transition-opacity hover:opacity-80"
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                border: 'none',
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-base)',
                
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: 'var(--elevation-md)'
              }}
            >
              Simulate Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manual Placement Screen Component
function ManualPlacementScreen({ 
  onDone
}: { 
  onDone: () => void;
}) {
  const handleReset = () => {
    // Reset placement logic would go here
    console.log('Reset manual placement');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Camera view - takes up most of the screen */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{
          overflow: 'hidden'
        }}
      >
        {/* Floor grid */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '60%',
            background: 'repeating-linear-gradient(0deg, rgba(47, 128, 237, 0.1) 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(47, 128, 237, 0.1) 0px, transparent 1px, transparent 20px)',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom'
          }}
        />
        
        {/* Placement indicator */}
        <div className="relative z-10">
          <div 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              opacity: 0.6,
              boxShadow: '0 0 30px var(--primary)'
            }}
          />
        </div>
      </div>

      {/* Bottom panel with step card styling - padded from edges */}
      <div 
        className="flex flex-col"
        style={{
          padding: 'var(--spacing-lg)'
        }}
      >
        <div className="bg-[rgba(0,0,0,0.5)] relative rounded-[10px]">
          <div aria-hidden="true" className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[10px]" />
          <div 
            className="flex flex-col"
            style={{
              padding: 'var(--spacing-lg)',
              gap: 'var(--spacing-md)'
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                
                color: 'white',
                textAlign: 'center',
                margin: 0
              }}
            >
              Tap on a surface to place. Pinch to rotate.
            </p>

            {/* Action buttons */}
            <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
              {/* Reset button */}
              <button
                onClick={handleReset}
                className="transition-opacity hover:opacity-80"
                style={{
                  flex: '0 0 auto',
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-base)',
                  
                  fontWeight: 'var(--font-weight-bold)',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
              
              {/* Done button */}
              <button
                onClick={onDone}
                className="transition-opacity hover:opacity-80"
                style={{
                  flex: 1,
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-base)',
                  
                  fontWeight: 'var(--font-weight-bold)',
                  boxShadow: 'var(--elevation-md)',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Correction Screen Component
function CorrectionScreen({ 
  onDone
}: { 
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Camera view - takes up most of the screen */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{
          overflow: 'hidden'
        }}
      >
        {/* Placed object representation */}
        <div className="relative z-10">
          <div 
            style={{
              width: '180px',
              height: '180px',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius)',
              opacity: 0.7,
              boxShadow: '0 4px 30px rgba(47, 128, 237, 0.5)'
            }}
          />
        </div>
        
        {/* Adjustment hint overlay - transparent dark panel */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-[rgba(0,0,0,0.5)] relative rounded-[10px]">
            <div aria-hidden="true" className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[10px]" />
            <div 
              className="text-center"
              style={{
                padding: 'var(--spacing-md)',
                fontSize: 'var(--text-sm)',
                
                fontWeight: 'var(--font-weight-bold)',
                color: 'white'
              }}
            >
              Drag to move • Pinch to rotate
            </div>
          </div>
        </div>
      </div>

      {/* Bottom panel with step card styling - padded from edges */}
      <div 
        className="flex flex-col"
        style={{
          padding: 'var(--spacing-lg)'
        }}
      >
        <div className="bg-[rgba(0,0,0,0.5)] relative rounded-[10px]">
          <div aria-hidden="true" className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[10px]" />
          <div 
            className="flex flex-col"
            style={{
              padding: 'var(--spacing-lg)',
              gap: 'var(--spacing-md)'
            }}
          >
            <div>
              <h2 
                style={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  
                  color: 'white',
                  margin: 0,
                  marginBottom: 'var(--spacing-xs)',
                  textAlign: 'center'
                }}
              >
                Need correction?
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  textAlign: 'center'
                }}
              >
                You can adjust the placement manually.
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={onDone}
              className="w-full transition-opacity hover:opacity-80"
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                border: 'none',
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-base)',
                
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: 'var(--elevation-md)'
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
