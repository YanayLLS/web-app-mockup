import svgPaths from "./svg-f6dy9oih9c";
type GoToStepButtonProps = {
  className?: string;
  property1?: "Default" | "Hovered" | "Selected" | "Visited";
};

function GoToStepButton({ className, property1 = "Default" }: GoToStepButtonProps) {
  const isDefault = property1 === "Default";
  const isHovered = property1 === "Hovered";
  const isSelected = property1 === "Selected";
  const isVisited = property1 === "Visited";
  return (
    <>
      {isDefault && (
        <button className="content-stretch cursor-pointer flex gap-[12px] items-center p-[8px] relative rounded-[10px] w-[267px]" data-name="Property 1=Default">
          <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal]">1</p>
            </div>
          </div>
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
          </div>
        </button>
      )}
      {isSelected && (
        <div className="content-stretch flex gap-[12px] items-center p-[8px] relative rounded-[10px] w-[267px]" data-name="Property 1=Selected">
          <div className="bg-[#2f80ed] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal]">1</p>
            </div>
          </div>
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#2f80ed] text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="font-['Open_Sans:Bold',sans-serif] font-bold leading-[normal] text-[12px] whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Step title will be two lines max and then and then it will be cut off
            </p>
          </div>
        </div>
      )}
      {isVisited && (
        <div className="content-stretch flex gap-[12px] items-center p-[8px] relative rounded-[10px] w-[267px]" data-name="Property 1=Visited">
          <div className="bg-[#7f7f7f] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal]">1</p>
            </div>
          </div>
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#7f7f7f] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
          </div>
        </div>
      )}
      {isHovered && (
        <div className="bg-[#d7d9df] content-stretch flex gap-[12px] items-center p-[8px] relative rounded-[10px] w-[267px]" data-name="Property 1=Hovered">
          <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center overflow-clip px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal]">1</p>
            </div>
          </div>
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProcedureMobileNew({ className }: { className?: string }) {
  return (
    <div className={className || "bg-gradient-to-b from-[#4362aa] h-[600px] relative rounded-[20px] to-[#00091d] w-[291px]"} data-name="Procedure Mobile New">
      <div className="content-stretch flex flex-col items-end justify-end overflow-clip relative rounded-[inherit] size-full">
        <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px overflow-clip p-[12px] relative" data-name="Step Selector Panel">
          <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-[267px]">
            <div className="relative shrink-0 size-[24px]" data-name="Icon/Back">
              <div className="-translate-y-1/2 absolute aspect-[16/16] left-[16.67%] right-[16.67%] top-1/2" data-name="arrow_back">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <path d={svgPaths.p3573eb00} fill="var(--fill-0, #36415D)" id="arrow_back" />
                </svg>
              </div>
            </div>
            <p className="flex-[1_0_0] font-['Open_Sans:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[#36415d] text-[16px] whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Procedure name it can be longer than expected, it can be short as well
            </p>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative w-[267px]" data-name="Steps List">
            <GoToStepButton className="relative rounded-[10px] shrink-0 w-full" property1="Visited" />
            <div className="relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#7f7f7f] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">2</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#7f7f7f] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Explore new features in the app with a brief overview.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#2f80ed] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">3</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#2f80ed] text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="font-['Open_Sans:Bold',sans-serif] font-bold leading-[normal] text-[12px] whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Step title will be two lines max and then and then it will be cut off
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">4</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Dive into the design process behind our latest layout.</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">5</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Review our roadmap for upcoming enhancements this quarter.</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">6</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Learn about integrations and how they improve productivity.</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">7</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Master tips and tricks for maximizing app potential.</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">8</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Get insights on data security and user privacy measures.</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">9</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Join our community forum to share ideas and suggestions.</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">10</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">{`Select the option `}</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="h-[29px] shrink-0 w-[22px]" data-name="indent" />
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">a</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Yes</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="h-[29px] shrink-0 w-[22px]" data-name="indent" />
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">b</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Understood</p>
                  </div>
                </div>
              </div>
            </button>
            <button className="cursor-pointer relative rounded-[10px] shrink-0 w-full" data-name="Go to Step Button">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">
                  <div className="h-[29px] shrink-0 w-[22px]" data-name="indent" />
                  <div className="bg-[#e9e9e9] content-stretch flex flex-col items-center justify-center px-[5px] relative rounded-[10px] shrink-0 size-[20px]">
                    <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">c</p>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#36415d] text-[12px] text-left" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal] whitespace-pre-wrap">Wrong issue</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div className="absolute bg-gradient-to-b bottom-0 from-[rgba(255,255,255,0)] h-[98px] left-px to-white w-[290px]" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-[21px]" />
    </div>
  );
}