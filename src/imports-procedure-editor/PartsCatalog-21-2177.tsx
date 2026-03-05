import svgPaths from "./svg-6kf0cwfvnb";
import imgXrayedIndication from "figma:asset/5d813d894961dd67c5b9e66493ac4ad5e1f2e755.png";

function Title() {
  return (
    <div className="h-full overflow-clip relative shrink-0 w-[83px]" data-name="Title">
      <div className="-translate-x-1/2 absolute bottom-0 flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] left-[41.5px] text-[#36415d] text-[12px] text-center top-0 w-[83px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre-wrap">Parts catalog</p>
      </div>
    </div>
  );
}

function Frame2() {
  return <div className="bg-[#c2c9db] h-full rounded-[25px] shrink-0 w-px" />;
}

function Spacer() {
  return <div className="flex-[1_0_0] h-[8px] min-h-px min-w-px" data-name="Spacer" />;
}

function IconMore() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" data-name="Icon/More">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon/More">
          <path d={svgPaths.p25ee9700} fill="var(--fill-0, #36415D)" id="more_horiz" />
        </g>
      </svg>
    </div>
  );
}

function PrimaryButtonGroup() {
  return (
    <div className="h-[30px] relative shrink-0 w-[26px]" data-name="Primary Button Group">
      <IconMore />
    </div>
  );
}

function IconEscape1() {
  return (
    <div className="absolute inset-[20.83%]" data-name="Icon/Escape">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon/Escape">
          <path d={svgPaths.p2aa77200} fill="var(--fill-0, #36415D)" />
        </g>
      </svg>
    </div>
  );
}

function IconEscape() {
  return (
    <button className="block cursor-pointer relative shrink-0 size-[24px]" data-name="Icon/Escape">
      <IconEscape1 />
    </button>
  );
}

function Header() {
  return (
    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-name="Header">
      <div className="flex flex-row items-center self-stretch">
        <Title />
      </div>
      <div className="flex flex-row items-center self-stretch">
        <Frame2 />
      </div>
      <Spacer />
      <PrimaryButtonGroup />
      <IconEscape />
    </div>
  );
}

function Divider() {
  return <div className="bg-[#c2c9db] h-px shrink-0 w-[303px]" data-name="Divider" />;
}

function IconSearch() {
  return (
    <div className="relative shrink-0 size-[7.447px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.44727 7.44727">
        <g id="Icon/Search">
          <path d={svgPaths.p136ec00} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function FrontlineSearchInputField() {
  return (
    <div className="bg-[#c2c9db] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Frontline Search Input Field">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between p-[6px] relative size-full">
          <div className="flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-full justify-center leading-[0] overflow-hidden relative shrink-0 text-[#36415d] text-[6.516px] text-ellipsis w-[94.953px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">Filter parts...</p>
          </div>
          <IconSearch />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#2e80ed] border-[0.465px] border-solid inset-0 pointer-events-none rounded-[18.618px]" />
    </div>
  );
}

function IconFilter() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.23px)] size-[16px] top-1/2" data-name="Icon/Filter">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon/Filter">
          <path d={svgPaths.p16758140} fill="var(--fill-0, #36415D)" id="filter_alt" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <IconFilter />
    </div>
  );
}

function Search() {
  return (
    <div className="content-stretch flex gap-[8px] h-[30px] items-center relative shrink-0 w-full" data-name="Search">
      <FrontlineSearchInputField />
      <Frame1 />
    </div>
  );
}

function Divider1() {
  return <div className="bg-[#c2c9db] h-px shrink-0 w-[303px]" data-name="Divider" />;
}

function IconChevron() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron />
    </div>
  );
}

function PartName() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-63 Pluritec EVO 2S</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch1() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye1() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye1 />
    </div>
  );
}

function IconXray() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed />
      <PartName />
      <IconSearch1 />
      <IconEye />
      <IconXray />
    </div>
  );
}

function IconChevron1() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed1() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron1 />
    </div>
  );
}

function PartName1() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.1.3-71-2 LENZ DRILL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch2() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye3() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye2() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye3 />
    </div>
  );
}

function IconXray1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent1() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed1 />
      <PartName1 />
      <IconSearch2 />
      <IconEye2 />
      <IconXray1 />
    </div>
  );
}

function IconDigitalTwinDefault() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="🔹 Icon/Digital Twin/Default">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="ð¹ Icon/Digital Twin/Default">
          <path d={svgPaths.p17218600} fill="var(--fill-0, #36415D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function PartName2() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-13 Accuprint AP30 I-L</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch3() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye5() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye4() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye5 />
    </div>
  );
}

function IconXray2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent2() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconDigitalTwinDefault />
      <PartName2 />
      <IconSearch3 />
      <IconEye4 />
      <IconXray2 />
    </div>
  );
}

function IconChevron2() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed2() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron2 />
    </div>
  );
}

function PartName3() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-49 Precious Metals ENIG Line</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch4() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye7() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye6() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye7 />
    </div>
  );
}

function IconXray3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent3() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed2 />
      <PartName3 />
      <IconSearch4 />
      <IconEye6 />
      <IconXray3 />
    </div>
  );
}

function IconChevron3() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed3() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron3 />
    </div>
  );
}

function PartName4() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.1.3-01 PumiFlex SHD 2000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch5() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye9() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye8() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye9 />
    </div>
  );
}

function IconXray4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent4() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed3 />
      <PartName4 />
      <IconSearch5 />
      <IconEye8 />
      <IconXray4 />
    </div>
  );
}

function IconChevron4() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed4() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron4 />
    </div>
  );
}

function PartName5() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-74 FluoroEtch Line</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch6() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye11() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye10() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye11 />
    </div>
  );
}

function IconXray5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent5() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed4 />
      <PartName5 />
      <IconSearch6 />
      <IconEye10 />
      <IconXray5 />
    </div>
  );
}

function IconChevron5() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed5() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron5 />
    </div>
  );
}

function PartName6() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-72 Micro Vu Excel 1601 UM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch7() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye13() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye12() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye13 />
    </div>
  );
}

function IconXray6() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent6() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed5 />
      <PartName6 />
      <IconSearch7 />
      <IconEye12 />
      <IconXray6 />
    </div>
  );
}

function PartName7() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-60 Plasma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch8() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye15() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye14() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye15 />
    </div>
  );
}

function IconXray7() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent7() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName7 />
      <IconSearch8 />
      <IconEye14 />
      <IconXray7 />
    </div>
  );
}

function PartName8() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-28 Orbotech Discovery II 8800 AOI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch9() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye17() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye16() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye17 />
    </div>
  );
}

function IconXray8() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent8() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName8 />
      <IconSearch9 />
      <IconEye16 />
      <IconXray8 />
    </div>
  );
}

function PartName9() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-43 DMVL-1230 O-L 231</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch10() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye19() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye18() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye19 />
    </div>
  );
}

function IconXray9() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent9() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName9 />
      <IconSearch10 />
      <IconEye18 />
      <IconXray9 />
    </div>
  );
}

function PartName10() {
  return (
    <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-09 Multi-Station # 7</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch11() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye21() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye20() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye21 />
    </div>
  );
}

function IconXray10() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent10() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName10 />
      <IconSearch11 />
      <IconEye20 />
      <IconXray10 />
    </div>
  );
}

function PartName11() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-38 Deburr</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch12() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye23() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye22() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye23 />
    </div>
  );
}

function IconXray11() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent11() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative rounded-[25px] shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName11 />
      <IconSearch12 />
      <IconEye22 />
      <IconXray11 />
    </div>
  );
}

function XrayedIndication() {
  return (
    <div className="absolute inset-[0_-0.07%_0_0] rounded-[18.618px]" data-name="Xrayed Indication">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18.618px] size-full" src={imgXrayedIndication} />
    </div>
  );
}

function PartName12() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <XrayedIndication />
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-29 Morton Auto.Lam. 1600-D</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch13() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye25() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye24() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye25 />
    </div>
  );
}

function IconXray12() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent12() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName12 />
      <IconSearch13 />
      <IconEye24 />
      <IconXray12 />
    </div>
  );
}

function PartName13() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px opacity-50 overflow-hidden relative text-[#7f7f7f] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-34 Stripper</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch14() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #7F7F7F)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function VisibilityOff() {
  return (
    <div className="absolute inset-[11.67%_4.17%_5.83%_4.17%]" data-name="visibility_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 9.216">
        <g id="visibility_off">
          <path d={svgPaths.p3d1ef600} fill="var(--fill-0, #7F7F7F)" id="visibility_off_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEyeDisabled1() {
  return (
    <div className="absolute contents inset-[11.67%_4.17%_5.83%_4.17%]" data-name="Icon/Eye Disabled">
      <VisibilityOff />
    </div>
  );
}

function IconEyeDisabled() {
  return (
    <div className="bg-white relative shrink-0 size-[11.171px]" data-name="Icon/Eye Disabled">
      <IconEyeDisabled1 />
    </div>
  );
}

function IconXray13() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent13() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName13 />
      <IconSearch14 />
      <IconEyeDisabled />
      <IconXray13 />
    </div>
  );
}

function PartName14() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-45 Reflow, ASI, Post Clean Machine</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch15() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye27() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye26() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye27 />
    </div>
  );
}

function IconXray14() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent14() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName14 />
      <IconSearch15 />
      <IconEye26 />
      <IconXray14 />
    </div>
  );
}

function PartName15() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-62 LPISM Spray Coater 9524</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch16() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye29() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye28() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye29 />
    </div>
  );
}

function IconXray15() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent15() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName15 />
      <IconSearch16 />
      <IconEye28 />
      <IconXray15 />
    </div>
  );
}

function PartName16() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#8404b3] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-41 Lamination Press 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch17() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye31() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye30() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye31 />
    </div>
  );
}

function IconXray16() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent16() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName16 />
      <IconSearch17 />
      <IconEye30 />
      <IconXray16 />
    </div>
  );
}

function PartName17() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-36 Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch18() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye33() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye32() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye33 />
    </div>
  );
}

function IconXray17() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent17() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <PartName17 />
      <IconSearch18 />
      <IconEye32 />
      <IconXray17 />
    </div>
  );
}

function IconChevron6() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed6() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron6 />
    </div>
  );
}

function PartName18() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">{`F-7.5.13-72 Orbotech Nuvogo 600 \"LDI\"`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch19() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye35() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye34() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye35 />
    </div>
  );
}

function IconXray18() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent18() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed6 />
      <PartName18 />
      <IconSearch19 />
      <IconEye34 />
      <IconXray18 />
    </div>
  );
}

function IconChevron7() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed7() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron7 />
    </div>
  );
}

function PartName19() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">{`F-7.5.13-27 Colight-1600 I-L `}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch20() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye37() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye36() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye37 />
    </div>
  );
}

function IconXray19() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent19() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed7 />
      <PartName19 />
      <IconSearch20 />
      <IconEye36 />
      <IconXray19 />
    </div>
  );
}

function IconChevron8() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed8() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron8 />
    </div>
  );
}

function PartName20() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-55 Chemical Storage Building</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch21() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye39() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye38() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye39 />
    </div>
  );
}

function IconXray20() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent20() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed8 />
      <PartName20 />
      <IconSearch21 />
      <IconEye38 />
      <IconXray20 />
    </div>
  );
}

function IconChevron9() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed9() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron9 />
    </div>
  );
}

function PartName21() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-22 Resist Stripper</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch22() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye41() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye40() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye41 />
    </div>
  );
}

function IconXray21() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent21() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed9 />
      <PartName21 />
      <IconSearch22 />
      <IconEye40 />
      <IconXray21 />
    </div>
  );
}

function IconChevron10() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed10() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron10 />
    </div>
  );
}

function PartName22() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-65 O-L White Tin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch23() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye43() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye42() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye43 />
    </div>
  );
}

function IconXray22() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent22() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed10 />
      <PartName22 />
      <IconSearch23 />
      <IconEye42 />
      <IconXray22 />
    </div>
  );
}

function IconChevron11() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed11() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron11 />
    </div>
  );
}

function PartName23() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-40 Plasma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch24() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye45() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye44() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye45 />
    </div>
  );
}

function IconXray23() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent23() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed11 />
      <PartName23 />
      <IconSearch24 />
      <IconEye44 />
      <IconXray23 />
    </div>
  );
}

function IconChevron12() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed12() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron12 />
    </div>
  );
}

function PartName24() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-23 Tinlead Tank # 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch25() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye47() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye46() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye47 />
    </div>
  );
}

function IconXray24() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent24() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed12 />
      <PartName24 />
      <IconSearch25 />
      <IconEye46 />
      <IconXray24 />
    </div>
  );
}

function IconChevron13() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed13() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron13 />
    </div>
  );
}

function PartName25() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.1.3-31 ProStar Film Processor</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch26() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye49() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye48() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye49 />
    </div>
  );
}

function IconXray25() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent25() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed13 />
      <PartName25 />
      <IconSearch26 />
      <IconEye48 />
      <IconXray25 />
    </div>
  );
}

function IconChevron14() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed14() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron14 />
    </div>
  );
}

function PartName26() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-10 Multi-Station # 8</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch27() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye51() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye50() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye51 />
    </div>
  );
}

function IconXray26() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent26() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed14 />
      <PartName26 />
      <IconSearch27 />
      <IconEye50 />
      <IconXray26 />
    </div>
  );
}

function IconChevron15() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed15() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron15 />
    </div>
  );
}

function PartName27() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13-17 Outer Layer Etch</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch28() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye53() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye52() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye53 />
    </div>
  );
}

function IconXray27() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent27() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed15 />
      <PartName27 />
      <IconSearch28 />
      <IconEye52 />
      <IconXray27 />
    </div>
  );
}

function IconChevron16() {
  return (
    <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.38458 7.44727">
        <g id="Icon/Chevron">
          <path d={svgPaths.p82b2080} fill="var(--fill-0, #36415D)" id="arrow_forward_ios" />
        </g>
      </svg>
    </div>
  );
}

function IconChevronCollapsed16() {
  return (
    <div className="relative rounded-[1.396px] shrink-0 size-[11.171px]" data-name="Icon/Chevron/Collapsed">
      <IconChevron16 />
    </div>
  );
}

function PartName28() {
  return (
    <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] overflow-hidden">F-7.5.13 -58 RWASTE TREATMENT O-L</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSearch29() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/Search">
          <path d={svgPaths.p2a2e6880} fill="var(--fill-0, #36415D)" id="Icon/Search_2" />
        </g>
      </svg>
    </div>
  );
}

function IconEye55() {
  return (
    <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.24 6.98182">
        <g id="Icon/Eye">
          <path d={svgPaths.p36ab0380} fill="var(--fill-0, #36415D)" id="visibility" />
        </g>
      </svg>
    </div>
  );
}

function IconEye54() {
  return (
    <div className="relative shrink-0 size-[11.171px]" data-name="Icon/Eye">
      <IconEye55 />
    </div>
  );
}

function IconXray28() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon/Xray">
          <path clipRule="evenodd" d={svgPaths.p27d04d80} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
        </g>
      </svg>
    </div>
  );
}

function PartItemComponent28() {
  return (
    <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
      <IconChevronCollapsed16 />
      <PartName28 />
      <IconSearch29 />
      <IconEye54 />
      <IconXray28 />
    </div>
  );
}

function PartsList() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] items-end min-h-px min-w-px overflow-x-clip overflow-y-auto relative w-full" data-name="Parts list">
      <PartItemComponent />
      <PartItemComponent1 />
      <PartItemComponent2 />
      <PartItemComponent3 />
      <PartItemComponent4 />
      <PartItemComponent5 />
      <PartItemComponent6 />
      <PartItemComponent7 />
      <PartItemComponent8 />
      <PartItemComponent9 />
      <PartItemComponent10 />
      <PartItemComponent11 />
      <PartItemComponent12 />
      <PartItemComponent13 />
      <PartItemComponent14 />
      <PartItemComponent15 />
      <PartItemComponent16 />
      <PartItemComponent17 />
      <PartItemComponent18 />
      <PartItemComponent19 />
      <PartItemComponent20 />
      <PartItemComponent21 />
      <PartItemComponent22 />
      <PartItemComponent23 />
      <PartItemComponent24 />
      <PartItemComponent25 />
      <PartItemComponent26 />
      <PartItemComponent27 />
      <PartItemComponent28 />
    </div>
  );
}

function Divider2() {
  return <div className="bg-[#c2c9db] h-px shrink-0 w-[303px]" data-name="Divider" />;
}

function IconMore1() {
  return (
    <div className="absolute left-[22.34px] size-[11.171px] top-[18.62px]" data-name="Icon/More">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1709 11.1709">
        <g id="Icon/More">
          <path d={svgPaths.p3b37b000} fill="var(--fill-0, #36415D)" id="more_horiz" />
        </g>
      </svg>
    </div>
  );
}

function SelectedPArts() {
  return (
    <div className="absolute content-stretch flex font-['Open_Sans:Regular',sans-serif] font-normal h-[15px] items-center justify-between leading-[0] left-[132.31px] p-[4.655px] text-[#36415d] text-[12px] top-[27.69px] w-[120px]" data-name="Selected PArts">
      <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center left-0 top-[7.5px] w-[103px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre-wrap">Selected Parts</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center right-0 text-right top-[7.5px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
    </div>
  );
}

function TotalParts() {
  return (
    <div className="absolute content-stretch flex font-['Open_Sans:Regular',sans-serif] font-normal h-[15px] items-center justify-between leading-[0] left-[132.31px] p-[4.655px] text-[#36415d] text-[12px] top-[3.69px] w-[120px]" data-name="Total Parts">
      <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center left-0 top-[7.5px] w-[81px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre-wrap">Total Parts</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center right-0 text-right top-[7.5px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[normal] whitespace-pre-wrap">242</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[rgba(217,224,240,0)] h-[49px] overflow-clip relative rounded-[4.655px] shrink-0 w-[283px]">
      <IconMore1 />
      <SelectedPArts />
      <TotalParts />
    </div>
  );
}

export default function PartsCatalog() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-center overflow-clip p-[10px] relative rounded-[9.309px] shadow-[0px_1.862px_9.123px_0px_rgba(0,0,0,0.55)] size-full" data-name="Parts Catalog">
      <Header />
      <Divider />
      <Search />
      <Divider1 />
      <PartsList />
      <Divider2 />
      <Frame />
    </div>
  );
}