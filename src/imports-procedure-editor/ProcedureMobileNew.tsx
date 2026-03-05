import svgPaths from "./svg-hd561eopnw";
import img from "figma:asset/73d7621064a2000e141ef24cc493e6ce3c514c35.png";
import img1 from "figma:asset/43a8891550287ad4c3c67e338a94edcd28083e46.png";

function IconPlay({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="Icon/Play">
      <div className="-translate-y-1/2 absolute aspect-[9/14] left-[33.33%] right-[29.17%] top-[calc(50%+0.25px)]" data-name="Icon/Play">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 14">
          <g id="Icon/Play">
            <path d={svgPaths.p1f7925f0} fill="var(--fill-0, white)" id="play_arrow" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function IconBack({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="Icon/Back">
      <div className="-translate-y-1/2 absolute aspect-[16/16] left-[16.67%] right-[16.67%] top-1/2" data-name="arrow_back">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p3573eb00} fill="var(--fill-0, white)" id="arrow_back" />
        </svg>
      </div>
    </div>
  );
}
type DescriptionProps = {
  className?: string;
  property1?: "Default" | "Variant2" | "Variant3";
};

function Description({ className, property1 = "Default" }: DescriptionProps) {
  const isDefault = property1 === "Default";
  const isVariant2 = property1 === "Variant2";
  const isVariant3 = property1 === "Variant3";
  return (
    <>
      {isDefault && (
        <div className="content-stretch flex h-[71px] items-center justify-center overflow-clip px-[4px] py-[6px] relative rounded-[10px] w-[279px]" data-name="Property 1=Default">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[normal] min-h-px min-w-px relative text-[12px] text-white whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="mb-0">
              {`In this step, you’ll begin by navigating to ...  See more `}
              <br aria-hidden="true" />
              main dashboard of the Digital Twin platform, where you can observe a real-time representation of the physical assets and their associated metadata. First, locate the Parts Catalog tab, which should be found on the left sidebar. Click on it to expand the catalog view and reveal the list of all available components in the current model. From here, scroll down or use the search functionality to locate specific parts you’d like to inspect or interact with.
            </p>
            <p className="mb-0">{`Once you’ve identified the relevant parts, hide the entire model by toggling the visibility of the root node. This action will ensure that none of the parts are visible in the 3D viewport, effectively clearing the scene. Then, proceed to search for individual parts again—preferably ones that are nested deep within a complex hierarchy structure. Select multiple parts from your search results by using the checkbox selectors, then unhide them by clicking the "Unhide" button. This should make only the selected parts and their required parent nodes visible.`}</p>
            <p className="mb-0">Next, apply the X-Ray effect to the selected parts. This will allow for semi-transparent visualization of the components, enabling easier inspection of internal details without fully hiding surrounding parts. After applying X-Ray, save the current view as a bookmark. This bookmark should capture the current state of visibility and rendering effects of each part in the model.</p>
            <p className="mb-0">To test the saved state, go to the bookmarks panel and select the one you just created. Ideally, the model should restore exactly to the saved configuration: only the selected parts and their necessary parent nodes should be visible, and the X-Ray effect should be applied only to the intended parts. Non-selected siblings or unrelated parts should remain hidden. Use this flow to verify proper behavior across different levels of hierarchy, complex part selections, and rendering states.</p>
            <p>This extended step simulates a realistic user workflow and includes enough text to overflow a container with a max height. The text will be cut off visually beyond [X] height without ellipsis, indicating to the user that they can scroll further to read the rest of the instructions. This behavior should remain consistent across various screen sizes and device orientations.</p>
          </div>
        </div>
      )}
      {isVariant2 && (
        <div className="h-[66px] relative rounded-[10px] w-[279px]" data-name="Property 1=Variant2">
          <div className="content-stretch flex gap-[10px] items-center justify-center overflow-clip px-[4px] py-[6px] relative rounded-[inherit] size-full">
            <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[normal] min-h-px min-w-px relative text-[12px] text-white whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="mb-0">
                {`In this step, you’ll begin by navigating to ...  See more `}
                <br aria-hidden="true" />
                main dashboard of the Digital Twin platform, where you can observe a real-time representation of the physical assets and their associated metadata. First, locate the Parts Catalog tab, which should be found on the left sidebar. Click on it to expand the catalog view and reveal the list of all available components in the current model. From here, scroll down or use the search functionality to locate specific parts you’d like to inspect or interact with.
              </p>
              <p className="mb-0">{`Once you’ve identified the relevant parts, hide the entire model by toggling the visibility of the root node. This action will ensure that none of the parts are visible in the 3D viewport, effectively clearing the scene. Then, proceed to search for individual parts again—preferably ones that are nested deep within a complex hierarchy structure. Select multiple parts from your search results by using the checkbox selectors, then unhide them by clicking the "Unhide" button. This should make only the selected parts and their required parent nodes visible.`}</p>
              <p className="mb-0">Next, apply the X-Ray effect to the selected parts. This will allow for semi-transparent visualization of the components, enabling easier inspection of internal details without fully hiding surrounding parts. After applying X-Ray, save the current view as a bookmark. This bookmark should capture the current state of visibility and rendering effects of each part in the model.</p>
              <p className="mb-0">To test the saved state, go to the bookmarks panel and select the one you just created. Ideally, the model should restore exactly to the saved configuration: only the selected parts and their necessary parent nodes should be visible, and the X-Ray effect should be applied only to the intended parts. Non-selected siblings or unrelated parts should remain hidden. Use this flow to verify proper behavior across different levels of hierarchy, complex part selections, and rendering states.</p>
              <p>This extended step simulates a realistic user workflow and includes enough text to overflow a container with a max height. The text will be cut off visually beyond [X] height without ellipsis, indicating to the user that they can scroll further to read the rest of the instructions. This behavior should remain consistent across various screen sizes and device orientations.</p>
            </div>
            <button className="absolute bg-[rgba(0,0,0,0.8)] content-stretch cursor-pointer flex gap-[10px] items-center p-[6px] right-[2px] rounded-[10px] top-[2px]" data-name="Edit text button">
              <div className="relative shrink-0 size-[16px]" data-name="Icon/Edit">
                <div className="absolute contents inset-[13.53%_15.15%_11.47%_16.67%]" data-name="Icon/Edit">
                  <div className="absolute inset-[13.53%_15.15%_11.47%_16.67%]" data-name="border_color">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3636 18">
                      <path d={svgPaths.p309f5400} fill="var(--fill-0, white)" id="border_color" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-left text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[normal]">Edit</p>
              </div>
            </button>
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[10px]" />
        </div>
      )}
      {isVariant3 && (
        <button className="content-stretch cursor-pointer flex flex-col gap-[2px] h-[140px] items-center justify-center px-[4px] py-[6px] relative rounded-[10px] w-[279px]" data-name="Property 1=Variant3">
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[10px]" />
          <div className="bg-white content-stretch flex gap-[11px] items-center p-[8px] relative rounded-[10px] shrink-0" data-name="Text edit toolbar">
            <div aria-hidden="true" className="absolute border border-[#c2c9db] border-solid inset-0 pointer-events-none rounded-[10px]" />
            <div className="flex flex-row items-center self-stretch">
              <div className="content-stretch flex h-full items-center px-[4px] py-[2px] relative shrink-0" data-name="Toolbar">
                <div aria-hidden="true" className="absolute border-[#36415d] border-r border-solid inset-0 pointer-events-none" />
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Undo">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path d={svgPaths.p82f1d80} fill="var(--fill-0, #36415D)" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Redo">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path d={svgPaths.p1c14ef00} fill="var(--fill-0, #36415D)" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center self-stretch">
              <div className="content-stretch flex h-full items-center px-[4px] py-[2px] relative shrink-0" data-name="Toolbar">
                <div aria-hidden="true" className="absolute border-[#36415d] border-r border-solid inset-0 pointer-events-none" />
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Bold">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path clipRule="evenodd" d={svgPaths.p32cb7080} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Strikethrough">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <div className="absolute inset-[20.83%_16.67%_20.81%_16.67%]" data-name="Group">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 14.005">
                        <g id="Group">
                          <path clipRule="evenodd" d={svgPaths.p19ce0f80} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                          <path d={svgPaths.p20f0ad00} fill="var(--fill-0, #36415D)" id="Vector_2" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Italic">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path clipRule="evenodd" d={svgPaths.p13f1a2c0} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Underline">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path clipRule="evenodd" d={svgPaths.p5740d80} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="bg-[#36415d] overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Left to right">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path clipRule="evenodd" d={svgPaths.paf36b80} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Right to left">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path clipRule="evenodd" d={svgPaths.pbb2b600} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center self-stretch">
              <div className="content-stretch flex gap-[8px] h-full items-center px-[4px] py-[2px] relative shrink-0" data-name="Toolbar">
                <div aria-hidden="true" className="absolute border-[#36415d] border-r border-solid inset-0 pointer-events-none" />
                <div className="content-stretch flex items-center justify-between overflow-clip p-[7px] relative rounded-[3px] shrink-0" data-name="Button menu - Font sizes">
                  <div className="h-[19px] overflow-clip relative shrink-0 w-[43px]" data-name="Container">
                    <div className="-translate-y-1/2 absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal h-[19px] justify-center leading-[0] left-0 text-[#36415d] text-[14px] text-left top-[9.5px] w-[28.28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal] whitespace-pre-wrap">12pt</p>
                    </div>
                  </div>
                  <div className="relative shrink-0 size-[10px]" data-name="SVG">
                    <div className="absolute inset-[0_0_0_-0.71%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.0708 10">
                        <g id="SVG">
                          <path d={svgPaths.p3d349200} fill="var(--fill-0, #36415D)" id="Vector" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Clear formatting">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path clipRule="evenodd" d={svgPaths.p1ff96a00} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="overflow-clip relative rounded-[3px] shrink-0 size-[34px]" data-name="Button - Format Painter">
                  <div className="absolute left-[5px] size-[24px] top-[5px]" data-name="SVG">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="SVG">
                        <path d={svgPaths.p2d9cf3a0} fill="var(--fill-0, #36415D)" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="cursor-pointer relative shrink-0 size-[24px]" data-name="SVG" role="button" tabIndex="0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <g id="SVG">
                  <path d={svgPaths.p3fd9e500} fill="var(--fill-0, #36415D)" id="Vector" />
                </g>
              </svg>
            </div>
          </div>
          <div className="bg-[#368dc4] content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px overflow-clip relative w-full">
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[normal] relative shrink-0 text-[12px] text-left text-white w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="mb-0">
                {`In this step, you’ll begin by navigating to ...  See more `}
                <br aria-hidden="true" />
                main dashboard of the Digital Twin platform, where you can observe a real-time representation of the physical assets and their associated metadata. First, locate the Parts Catalog tab, which should be found on the left sidebar. Click on it to expand the catalog view and reveal the list of all available components in the current model. From here, scroll down or use the search functionality to locate specific parts you’d like to inspect or interact with.
              </p>
              <p className="mb-0">{`Once you’ve identified the relevant parts, hide the entire model by toggling the visibility of the root node. This action will ensure that none of the parts are visible in the 3D viewport, effectively clearing the scene. Then, proceed to search for individual parts again—preferably ones that are nested deep within a complex hierarchy structure. Select multiple parts from your search results by using the checkbox selectors, then unhide them by clicking the "Unhide" button. This should make only the selected parts and their required parent nodes visible.`}</p>
              <p className="mb-0">Next, apply the X-Ray effect to the selected parts. This will allow for semi-transparent visualization of the components, enabling easier inspection of internal details without fully hiding surrounding parts. After applying X-Ray, save the current view as a bookmark. This bookmark should capture the current state of visibility and rendering effects of each part in the model.</p>
              <p className="mb-0">To test the saved state, go to the bookmarks panel and select the one you just created. Ideally, the model should restore exactly to the saved configuration: only the selected parts and their necessary parent nodes should be visible, and the X-Ray effect should be applied only to the intended parts. Non-selected siblings or unrelated parts should remain hidden. Use this flow to verify proper behavior across different levels of hierarchy, complex part selections, and rendering states.</p>
              <p>This extended step simulates a realistic user workflow and includes enough text to overflow a container with a max height. The text will be cut off visually beyond [X] height without ellipsis, indicating to the user that they can scroll further to read the rest of the instructions. This behavior should remain consistent across various screen sizes and device orientations.</p>
            </div>
          </div>
        </button>
      )}
    </>
  );
}
type TitleProps = {
  className?: string;
  property1?: "Default" | "Variant2" | "Variant3";
};

function Title({ className, property1 = "Default" }: TitleProps) {
  const isDefault = property1 === "Default";
  const isVariant2 = property1 === "Variant2";
  const isVariant3 = property1 === "Variant3";
  return (
    <>
      {isDefault && (
        <div className="content-stretch flex items-center justify-center px-[4px] py-[6px] relative rounded-[10px] w-[279px]" data-name="Property 1=Default">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] min-h-px min-w-px relative text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
          </div>
        </div>
      )}
      {isVariant2 && (
        <div className="content-stretch flex gap-[10px] items-center justify-center px-[4px] py-[6px] relative rounded-[10px] w-[279px]" data-name="Property 1=Variant2">
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[10px]" />
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] min-h-px min-w-px relative text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
          </div>
          <button className="absolute bg-[rgba(0,0,0,0.8)] content-stretch cursor-pointer flex gap-[10px] items-center p-[6px] right-[2px] rounded-[10px] top-[2px]" data-name="Edit text button">
            <div className="relative shrink-0 size-[16px]" data-name="Icon/Edit">
              <div className="absolute contents inset-[13.53%_15.15%_11.47%_16.67%]" data-name="Icon/Edit">
                <div className="absolute inset-[13.53%_15.15%_11.47%_16.67%]" data-name="border_color">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3636 18">
                    <path d={svgPaths.p309f5400} fill="var(--fill-0, white)" id="border_color" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[10px] text-left text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal]">Edit</p>
            </div>
          </button>
        </div>
      )}
      {isVariant3 && (
        <button className="content-stretch cursor-pointer flex items-center justify-center px-[4px] py-[6px] relative rounded-[10px] w-[279px]" data-name="Property 1=Variant3">
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[10px]" />
          <div className="bg-[#368dc4] content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px min-w-px relative">
            <div className="flex flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-left text-white w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
            </div>
          </div>
        </button>
      )}
    </>
  );
}

function IconChevronUncollapsed({ className }: { className?: string }) {
  return (
    <div className={className || "relative rounded-[3px] size-[24px]"} data-name="Icon/Chevron/Uncollapsed">
      <div className="absolute flex inset-[32.15%_17.87%_28.6%_15.46%] items-center justify-center">
        <div className="flex-none h-[16px] rotate-90 w-[9.42px]">
          <div className="relative size-full" data-name="Icon/Chevron">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
              <g id="Icon/Chevron">
                <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
type TtsProps = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function Tts({ className, property1 = "Default" }: TtsProps) {
  const isDefault = property1 === "Default";
  const isVariant2 = property1 === "Variant2";
  return (
    <button className={className || `content-stretch flex items-center justify-between relative w-[61px] ${isVariant2 ? "p-[4px]" : ""}`}>
      {isDefault && (
        <div className="relative shrink-0 size-[32px]" data-name="Icon/Text to Speech">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[14.167px] left-1/2 top-[calc(50%-0.49px)] w-[14px]" data-name="text_to_speech">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14.1667">
              <path d={svgPaths.p184348c0} fill="var(--fill-0, white)" id="text_to_speech" />
            </svg>
          </div>
        </div>
      )}
      <p className={`font-["Open_Sans:Regular",sans-serif] font-normal leading-[normal] relative shrink-0 text-[12px] text-left ${isVariant2 ? "text-[#7f7f7f]" : "text-white"}`} style={{ fontVariationSettings: "'wdth' 100" }}>
        Read
      </p>
      {isVariant2 && (
        <div className="relative shrink-0 size-[24px]" data-name="Icon/Text to Speech Off">
          <div className="-translate-y-1/2 absolute aspect-[10.075217247009277/13.447494506835938] left-[20.83%] right-[37.19%] top-1/2" data-name="Text to Speech Off">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.0752 13.4475">
              <path d={svgPaths.p30677e00} fill="var(--fill-0, white)" id="Text to Speech Off" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}
type ActionButtonProps = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function ActionButton({ className, property1 = "Default" }: ActionButtonProps) {
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || "content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[10px] w-[32px]"}>
      <div className="relative shrink-0 size-[16px]" data-name="Icon/Design">
        <div className="absolute inset-[12.19%_12.5%_12.81%_12.5%]" data-name="Icon/Design">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <g id="Icon/Design">
              <path d={svgPaths.p1c546a00} fill="var(--fill-0, white)" id="palette" />
            </g>
          </svg>
        </div>
      </div>
      {isVariant2 && (
        <>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[10px]" />
          <div className="-translate-x-1/2 absolute bg-white content-stretch flex flex-col items-start left-1/2 p-[6px] rounded-[10px] top-[38px]" data-name="Tooltip">
            <div aria-hidden="true" className="absolute border-2 border-[#d9e0f0] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[1px_1px_10px_0px_rgba(0,0,0,0.15)]" />
            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#36415d] text-[12px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal] whitespace-pre-wrap">This is the tooltips text, it can be changed to different texts and be multilined</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
type SkipPreviousProps = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function SkipPrevious({ className, property1 = "Default" }: SkipPreviousProps) {
  const isDefault = property1 === "Default";
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || `h-[26px] relative rounded-[25px] ${isVariant2 ? "" : "content-stretch flex items-center justify-center overflow-clip px-[8px] py-[5px]"}`}>
      {isDefault && (
        <>
          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
            Parts catalog
          </p>
          <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
        </>
      )}
      {isVariant2 && (
        <>
          <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit]">
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
              Parts catalog
            </p>
            <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
        </>
      )}
    </div>
  );
}
type SkipPrevious1Props = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function SkipPrevious1({ className, property1 = "Default" }: SkipPrevious1Props) {
  const isDefault = property1 === "Default";
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || `h-[26px] relative rounded-[25px] ${isVariant2 ? "" : "content-stretch flex items-center justify-center overflow-clip px-[8px] py-[5px]"}`}>
      {isDefault && (
        <>
          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
            Bookmarks
          </p>
          <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
        </>
      )}
      {isVariant2 && (
        <>
          <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit]">
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
              Bookmarks
            </p>
            <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
        </>
      )}
    </div>
  );
}
type SkipPrevious2Props = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function SkipPrevious2({ className, property1 = "Default" }: SkipPrevious2Props) {
  const isDefault = property1 === "Default";
  const isVariant2 = property1 === "Variant2";
  return (
    <a className={className || `h-[26px] relative rounded-[25px] w-[61px] ${isVariant2 ? "" : "content-stretch flex items-center justify-center overflow-clip px-[8px] py-[5px]"}`} href="https://www.figma.com/proto/zH5mc9RmSaAWJ2F7F7DF0X/Animation-Builder?page-id=0%3A1&node-id=610-8481&viewport=779%2C1482%2C0.35&t=aGt1UFLymd65AkJK-9&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=610%3A8481&show-proto-sidebar=1">
      {isDefault && (
        <>
          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-left text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
            Animate
          </p>
          <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
        </>
      )}
      {isVariant2 && (
        <>
          <div className="content-stretch flex items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit] size-full">
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-left text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
              Animate
            </p>
            <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
        </>
      )}
    </a>
  );
}
type SkipPrevious3Props = {
  className?: string;
  property1?: "Default" | "Variant3";
};

function SkipPrevious3({ className, property1 = "Default" }: SkipPrevious3Props) {
  const isDefault = property1 === "Default";
  const isVariant3 = property1 === "Variant3";
  return (
    <>
      {isDefault && (
        <button className="content-stretch cursor-pointer flex h-[26px] items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[25px]" data-name="Property 1=Default">
          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-left text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
            Set digital twin state from view
          </p>
        </button>
      )}
      {isVariant3 && (
        <div className="h-[26px] relative rounded-[10px]" data-name="Property 1=Variant3">
          <div className="content-stretch flex gap-[6px] h-full items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit]">
            <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
              Change state to current
            </p>
            <div className="bg-white h-full shrink-0 w-px" />
            <button className="block cursor-pointer relative shrink-0 size-[16px]" data-name="Icon/Escape">
              <div className="absolute contents inset-[20.83%]" data-name="Icon/Escape">
                <div className="absolute inset-[20.83%]" data-name="close">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                    <path d={svgPaths.p2aa77200} fill="var(--fill-0, white)" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[10px]" />
        </div>
      )}
    </>
  );
}

function Header({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[rgba(0,0,0,0.5)] content-stretch flex gap-[2px] items-center p-[8px] relative rounded-[100px]"} data-name="Header">
      <div aria-hidden="true" className="absolute border border-[#36415d] border-solid inset-0 pointer-events-none rounded-[100px] shadow-[0px_4px_40px_0px_rgba(0,0,0,0.5)]" />
      <SkipPrevious3 className="content-stretch cursor-pointer flex h-[26px] items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[25px] shrink-0" />
      <SkipPrevious2 className="content-stretch cursor-pointer flex h-[26px] items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[25px] shrink-0 w-[61px]" />
      <SkipPrevious1 className="content-stretch flex h-[26px] items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[25px] shrink-0" />
      <SkipPrevious className="content-stretch flex h-[26px] items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[25px] shrink-0" />
      <div className="flex flex-row items-center self-stretch">
        <div className="bg-[#36415d] h-full shrink-0 w-px" />
      </div>
      <div className="content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[10px] shrink-0 w-[32px]" data-name="Settable Action Button">
        <div className="relative shrink-0 size-[16px]" data-name="Icon/Design">
          <div className="absolute inset-[12.19%_12.5%_12.81%_12.5%]" data-name="Icon/Design">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <g id="Icon/Design">
                <path d={svgPaths.p1b58bb80} fill="var(--fill-0, white)" id="palette" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[10px] shrink-0 w-[32px]" data-name="Settable Action Button">
        <div className="relative shrink-0 size-[16px]" data-name="Icon/Image">
          <div className="absolute contents inset-[8.33%]" data-name="Icon/Image">
            <div className="absolute inset-[8.33%]" data-name="imagesmode">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p20d36f80} fill="var(--fill-0, white)" id="imagesmode" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[10px] shrink-0 w-[32px]" data-name="Settable Action Button">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon/Branch Split">
          <div className="-translate-y-1/2 absolute aspect-[16/16] left-[16.67%] right-[16.67%] top-1/2" data-name="arrow_split">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
              <path d={svgPaths.p9e48940} fill="var(--fill-0, white)" id="arrow_split" />
            </svg>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[10px] shrink-0 w-[32px]" data-name="Settable Action Button">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon/Popup">
          <div className="-translate-x-1/2 absolute aspect-[20/20] bottom-[16.67%] left-1/2 top-[16.67%]" data-name="chat_info">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
              <path d={svgPaths.p2cd18a80} fill="var(--fill-0, white)" id="chat_info" />
            </svg>
          </div>
        </div>
      </div>
      <ActionButton className="content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[10px] shrink-0 w-[32px]" />
    </div>
  );
}

export default function ProcedureMobileNew({ className }: { className?: string }) {
  return (
    <div className={className || "bg-gradient-to-b from-[#4362aa] h-[900px] relative rounded-[20px] to-[#00091d] w-[1440px]"} data-name="Procedure Mobile New">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip py-[8px] relative rounded-[inherit] size-full">
        <button className="-translate-x-1/2 -translate-y-1/2 absolute block cursor-pointer h-[348px] left-[calc(50%-0.5px)] top-1/2 w-[269px]" data-name="Digital Twin">
          <div className="absolute inset-[0_-1.66%]" data-name="generator state 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img} />
          </div>
        </button>
        <Header className="bg-[rgba(0,0,0,0.5)] content-stretch flex gap-[2px] items-center p-[8px] relative rounded-[100px] shrink-0" />
        <div className="flex-[1_0_0] min-h-px min-w-px w-full" data-name="Spacer" />
        <div className="content-stretch flex items-end justify-end relative shadow-[0px_4px_48.9px_0px_rgba(0,0,0,0.5)] shrink-0 w-[700px]" data-name="Procedure UI holder - Desktop">
          <div className="bg-[rgba(0,0,0,0.5)] flex-[1_0_0] min-h-px min-w-px relative rounded-[10px]" data-name="Body">
            <div aria-hidden="true" className="absolute border border-[#36415d] border-solid inset-0 pointer-events-none rounded-[10px]" />
            <div className="flex flex-col items-center justify-center size-full">
              <div className="content-stretch flex flex-col gap-[8px] items-center justify-center p-[8px] relative w-full">
                <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
                  <div className="content-stretch flex flex-[1_0_0] items-end min-h-px min-w-px relative" data-name="Procedure Text Panel">
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-end min-h-px min-w-px relative">
                      <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="header">
                        <Tts className="content-stretch cursor-pointer flex items-center justify-between relative shrink-0 w-[61px]" />
                        <div className="content-stretch flex items-start p-[4px] relative shrink-0" data-name="Options">
                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[12px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Step 1 of 10
                          </p>
                          <div className="relative shrink-0 size-[16px]" data-name="arrow_split">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                              <g id="arrow_split">
                                <mask height="16" id="mask0_1_1765" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
                                  <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
                                </mask>
                                <g mask="url(#mask0_1_1765)">
                                  <path d={svgPaths.p1152fd20} fill="var(--fill-0, white)" id="arrow_split_2" />
                                </g>
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                          <div className="flex-[1_0_0] h-full min-h-px min-w-px" />
                        </div>
                        <div className="content-stretch flex items-start p-[4px] relative shrink-0" data-name="Options">
                          <IconChevronUncollapsed className="relative rounded-[3px] shrink-0 size-[12px]" />
                        </div>
                      </div>
                      <button className="content-stretch cursor-pointer flex flex-col gap-[3px] h-[61px] items-start relative shrink-0 w-full" data-name="Text box">
                        <Title className="relative rounded-[10px] shrink-0 w-full" />
                        <Description className="flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] w-full" />
                      </button>
                    </div>
                  </div>
                </div>
                <button className="cursor-pointer relative shrink-0 w-full" data-name="Options">
                  <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative w-full">
                      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                        <div className="content-stretch cursor-pointer flex flex-[1_0_0] gap-[3px] h-full items-center justify-center min-h-px min-w-px overflow-x-auto overflow-y-clip relative">
                          <div className="bg-[rgba(0,0,0,0.5)] content-stretch flex gap-[10px] items-center justify-center px-[12px] py-[8px] relative rounded-[25px] shrink-0" data-name="Step option" role="button" tabIndex="0">
                            <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                              <p className="leading-[normal]">Sure thing!</p>
                            </div>
                          </div>
                          <div className="bg-[rgba(0,0,0,0.5)] content-stretch flex gap-[10px] items-center justify-center px-[12px] py-[8px] relative rounded-[25px] shrink-0" data-name="Step option" role="button" tabIndex="0">
                            <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                            <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                              <p className="leading-[normal]">Absolutely!</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
                <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Procedure Controls Player">
                  <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0 w-full" data-name="Bottom">
                    <div className="bg-[rgba(217,224,240,0)] content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-center min-h-px min-w-px relative rounded-[25px]" data-name="Player Buttons">
                      <div className="flex flex-row items-center self-stretch">
                        <div className="bg-[rgba(0,0,0,0.5)] h-full relative rounded-[25px] shrink-0 w-[50px]" data-name="skip_previous">
                          <div className="overflow-clip relative rounded-[inherit] size-full">
                            <IconBack className="absolute left-[17px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-17px_-9.5px] mask-size-[40px_40px] size-[16px] top-[9.5px]" />
                          </div>
                          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                        </div>
                      </div>
                      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                        <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Spacer" />
                      </div>
                      <div className="bg-[#2f80ed] content-stretch flex h-[35px] items-center justify-center px-[16px] py-[8px] relative rounded-[25px] shrink-0 w-[50px]" data-name="Next button">
                        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Next
                        </p>
                      </div>
                      <button className="-translate-x-1/2 absolute bg-[rgba(0,0,0,0.5)] cursor-pointer h-[34px] left-1/2 rounded-[25px] top-px w-[61px]" data-name="skip_previous">
                        <div className="content-stretch flex items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit] size-full">
                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-left text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Play
                          </p>
                          <IconPlay className="relative shrink-0 size-[16px]" />
                          <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />
                        </div>
                        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute content-stretch flex flex-col items-end justify-center p-[12px] right-0 rounded-[10px] top-0" data-name="Side Buttons">
          <div className="bg-[rgba(0,0,0,0.5)] content-stretch flex flex-col gap-[10px] items-center relative rounded-[10px] shrink-0">
            <div aria-hidden="true" className="absolute border border-[#36415d] border-solid inset-0 pointer-events-none rounded-[10px]" />
            <a className="content-stretch cursor-pointer flex h-[31.877px] items-center overflow-clip p-[6.375px] relative shrink-0" data-name="Close Button" href="https://www.figma.com/proto/MjDbu7MDaFQedPyFpqHH9o/Frontline-App?page-id=0%3A1&node-id=391-18728&viewport=4903%2C5024%2C0.61&t=rzCnYZRgSrCC9ryl-9&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=391%3A18728&show-proto-sidebar=1">
              <div className="relative shrink-0 size-[19.126px]" data-name="Icon/Escape">
                <div className="absolute contents inset-[20.83%]" data-name="Icon/Escape">
                  <div className="absolute inset-[20.83%]" data-name="close">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p2aa77200} fill="var(--fill-0, white)" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[32px]" data-name="More options button">
              <div className="relative shrink-0 size-[16px]" data-name="Icon/More">
                <div className="-translate-x-1/2 absolute aspect-[2.0000000596046448/8.000000238418579] bottom-1/4 flex items-center justify-center left-1/2 top-1/4">
                  <div className="flex-none h-[2px] rotate-90 w-[8px]">
                    <div className="relative size-full" data-name="more_horiz">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 2">
                        <path d={svgPaths.p2f968100} fill="var(--fill-0, white)" id="more_horiz" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[32px]" data-name="Place button">
              <div className="relative shrink-0 size-[16px]" data-name="Icon/Eye">
                <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
                  <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                      <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-[rgba(0,0,0,0.5)] bottom-[8px] content-stretch flex flex-col gap-[10px] items-start left-[6.5px] p-[12px] rounded-[10px]" data-name="Media holder">
          <div aria-hidden="true" className="absolute border border-[#36415d] border-solid inset-0 pointer-events-none rounded-[10px]" />
          <div className="content-stretch flex items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[10px] items-center justify-center overflow-clip relative shrink-0 w-[332px]" data-name="Full screen Media">
              <div className="aspect-[1408/826] bg-black content-stretch flex flex-col gap-[10px] items-start justify-center py-[40px] relative shrink-0 w-full" data-name="Media">
                <div className="flex-[1_0_0] min-h-px min-w-px overflow-clip relative w-full" data-name="image">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1} />
                  <IconPlay className="absolute inset-[30.76%_39.81%]" />
                </div>
                <div className="absolute bottom-0 flex items-center justify-center right-0 size-[33.941px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
                  <div className="flex-none rotate-45">
                    <div className="overflow-clip relative size-[24px]" data-name="Full screen">
                      <div className="absolute right-0 size-[24px] top-0" data-name="Icon/Full Screen">
                        <div className="absolute inset-[29.17%_8.33%]" data-name="arrows_outward">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 10">
                            <path d={svgPaths.p2d5be72} fill="var(--fill-0, white)" id="arrows_outward" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-[21px]" />
    </div>
  );
}