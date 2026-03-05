import svgPaths from "./svg-xq2ov5guq2";
import { imgIconBack } from "./svg-qgkcz";

function IconTextToSpeech() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Icon/Text to Speech">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon/Text to Speech">
          <path d={svgPaths.p1714e540} fill="var(--fill-0, white)" id="text_to_speech" />
        </g>
      </svg>
    </div>
  );
}

function Tts() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[61px]" data-name="TTS">
      <IconTextToSpeech />
      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[12px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        Read
      </p>
    </div>
  );
}

function ArrowSplit() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="arrow_split">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="arrow_split">
          <mask height="16" id="mask0_42_5809" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
          </mask>
          <g mask="url(#mask0_42_5809)">
            <path d={svgPaths.p1152fd20} fill="var(--fill-0, white)" id="arrow_split_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Options() {
  return (
    <div className="content-stretch flex items-start p-[4px] relative shrink-0" data-name="Options">
      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[12px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        Step 1 of 10
      </p>
      <ArrowSplit />
    </div>
  );
}

function Frame3() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" />;
}

function IconChevron() {
  return (
    <div className="relative size-full" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.71 8">
        <g id="Icon/Chevron">
          <path d={svgPaths.p3c1abe80} fill="var(--fill-0, white)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronUncollapsed() {
  return (
    <div className="relative rounded-[3px] shrink-0 size-[12px]" data-name="Icon/Chevron/Uncollapsed">
      <div className="absolute flex inset-[32.15%_17.87%_28.6%_15.46%] items-center justify-center">
        <div className="flex-none h-[8px] rotate-90 w-[4.71px]">
          <IconChevron />
        </div>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="content-stretch flex items-start p-[4px] relative shrink-0" data-name="Options">
      <IconChevronUncollapsed />
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="header">
      <Tts />
      <Options />
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Frame3 />
      </div>
      <Options1 />
    </div>
  );
}

function Title() {
  return (
    <div className="relative rounded-[10px] shrink-0 w-full" data-name="Title">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[4px] py-[6px] relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Bold',sans-serif] font-bold justify-center leading-[0] min-h-px min-w-px relative text-[16px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Step title will be two lines max and then and then it will be cut off</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Description() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] w-full" data-name="Description">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[4px] py-[6px] relative size-full">
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
      </div>
    </div>
  );
}

function TextBox() {
  return (
    <div className="content-stretch flex flex-col gap-[3px] h-[61px] items-start relative shrink-0 w-full" data-name="Text box">
      <Title />
      <Description />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-end min-h-px min-w-px relative">
      <Header />
      <TextBox />
    </div>
  );
}

function ProcedureTextPanel() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-end min-h-px min-w-px relative" data-name="Procedure Text Panel">
      <Frame1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <ProcedureTextPanel />
    </div>
  );
}

function StepOption() {
  return (
    <div className="bg-[rgba(0,0,0,0.5)] content-stretch flex gap-[10px] items-center justify-center px-[12px] py-[8px] relative rounded-[25px] shrink-0" data-name="Step option">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
      <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Sure thing!</p>
      </div>
    </div>
  );
}

function StepOption1() {
  return (
    <div className="bg-[rgba(0,0,0,0.5)] content-stretch flex gap-[10px] items-center justify-center px-[12px] py-[8px] relative rounded-[25px] shrink-0" data-name="Step option">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
      <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal]">Absolutely!</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] h-full items-center justify-center min-h-px min-w-px overflow-x-auto overflow-y-clip relative">
      <StepOption />
      <StepOption1 />
    </div>
  );
}

function Options2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Options">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center p-[8px] relative w-full">
          <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
            <Frame2 />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBack() {
  return (
    <div className="absolute left-[17px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-17px_-9.5px] mask-size-[40px_40px] size-[16px] top-[9.5px]" data-name="Icon/Back" style={{ maskImage: `url('${imgIconBack}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon/Back">
          <path d={svgPaths.pcb35680} fill="var(--fill-0, white)" id="arrow_back" />
        </g>
      </svg>
    </div>
  );
}

function SkipPrevious() {
  return (
    <div className="bg-[rgba(0,0,0,0.5)] h-full relative rounded-[25px] shrink-0 w-[50px]" data-name="skip_previous">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <IconBack />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
    </div>
  );
}

function Spacer() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Spacer" />;
}

function NextButton() {
  return (
    <div className="bg-[#2f80ed] content-stretch flex h-[35px] items-center justify-center px-[16px] py-[8px] relative rounded-[25px] shrink-0 w-[50px]" data-name="Next button">
      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        Next
      </p>
    </div>
  );
}

function IconPlay1() {
  return (
    <div className="-translate-y-1/2 absolute aspect-[6/8.926786422729492] left-[33.33%] right-[29.17%] top-[calc(50%+0.25px)]" data-name="Icon/Play">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8.92679">
        <g id="Icon/Play">
          <path d={svgPaths.p6f86700} fill="var(--fill-0, white)" id="play_arrow" />
        </g>
      </svg>
    </div>
  );
}

function IconPlay() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon/Play">
      <IconPlay1 />
    </div>
  );
}

function FilledBar() {
  return <div className="absolute inset-[0_100.82%_0_-2.46%]" data-name="filled bar" />;
}

function SkipPrevious1() {
  return (
    <div className="-translate-x-1/2 absolute bg-[rgba(0,0,0,0.5)] h-[34px] left-[calc(50%-0.5px)] rounded-[25px] top-px w-[61px]" data-name="skip_previous">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit] size-full">
        <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[10px] text-white" dir="auto" style={{ fontVariationSettings: "'wdth' 100" }}>
          Play
        </p>
        <IconPlay />
        <FilledBar />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
    </div>
  );
}

function PlayerButtons() {
  return (
    <div className="bg-[rgba(217,224,240,0)] content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-center min-h-px min-w-px relative rounded-[25px]" data-name="Player Buttons">
      <div className="flex flex-row items-center self-stretch">
        <SkipPrevious />
      </div>
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Spacer />
      </div>
      <NextButton />
      <SkipPrevious1 />
    </div>
  );
}

function Bottom() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0 w-full" data-name="Bottom">
      <PlayerButtons />
    </div>
  );
}

function ProcedureControlsPlayer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Procedure Controls Player">
      <Bottom />
    </div>
  );
}

function Body() {
  return (
    <div className="bg-[rgba(0,0,0,0.5)] flex-[1_0_0] min-h-px min-w-px relative rounded-[10px]" data-name="Body">
      <div aria-hidden="true" className="absolute border border-[#36415d] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center justify-center p-[8px] relative w-full">
          <Frame />
          <Options2 />
          <ProcedureControlsPlayer />
        </div>
      </div>
    </div>
  );
}

export default function ProcedureUiHolderDesktop() {
  return (
    <div className="content-stretch flex items-end justify-end relative shadow-[0px_4px_48.9px_0px_rgba(0,0,0,0.5)] size-full" data-name="Procedure UI holder - Desktop">
      <Body />
    </div>
  );
}