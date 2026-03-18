import svgPaths from "../../../imports/svg-hd561eopnw";

interface SideButtonsProps {
  onEnterAR?: () => void;
  onOpenPlacement?: () => void;
  isARMode?: boolean;
  isMobileView?: boolean;
}

export function SideButtons({ onEnterAR, onOpenPlacement, isARMode = false, isMobileView = false }: SideButtonsProps) {
  // Check if we're on mobile (screen width < 768px) or in mobile view mode
  const isMobile = isMobileView || (typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <div className="absolute content-stretch flex flex-col items-end justify-center p-[12px] right-0 rounded-[10px] top-0">
      <div className="bg-[rgba(0,0,0,0.5)] content-stretch flex flex-col gap-[10px] items-center relative rounded-[10px] shrink-0">
        <div aria-hidden="true" className="absolute border border-[#36415d] border-solid inset-0 pointer-events-none rounded-[10px]" />
        
        {/* X button */}
        <button className="content-stretch cursor-pointer flex h-[31.877px] items-center overflow-clip p-[6.375px] relative shrink-0">
          <div className="relative shrink-0 size-[19.126px]">
            <div className="absolute contents inset-[20.83%]">
              <div className="absolute inset-[20.83%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                  <path d={svgPaths.p2aa77200} fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* AR Button - Only on mobile */}
        {isMobile && (
          <button 
            onClick={onEnterAR}
            className="content-stretch cursor-pointer flex items-center justify-center overflow-clip relative shrink-0 transition-opacity hover:opacity-70 size-[32px]"
            title={isARMode ? "AR Placement" : "Enter AR Mode"}
          >
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                
                fontWeight: 'var(--font-weight-bold)',
                color: 'white'
              }}
            >
              AR
            </span>
          </button>
        )}

        {/* Place Button - Only on mobile */}
        {isMobile && (
          <button 
            onClick={onOpenPlacement}
            className="content-stretch cursor-pointer flex items-center justify-center overflow-clip relative shrink-0 transition-opacity hover:opacity-70 size-[32px]"
            title="Place object"
          >
            <svg 
              className="size-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="white" 
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
          </button>
        )}
        
        <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[32px]">
          <div className="relative shrink-0 size-[16px]">
            <div className="-translate-x-1/2 absolute aspect-[2.0000000596046448/8.000000238418579] bottom-1/4 flex items-center justify-center left-1/2 top-1/4">
              <div className="flex-none h-[2px] rotate-90 w-[8px]">
                <div className="relative size-full">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 2">
                    <path d={svgPaths.p2f968100} fill="white" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[32px]">
          <div className="relative shrink-0 size-[16px]">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
