import svgPaths from "./svg-y47gfye35l";
import img from "figma:asset/5d813d894961dd67c5b9e66493ac4ad5e1f2e755.png";
type PartItemComponentProps = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function PartItemComponent({ className, property1 = "Default" }: PartItemComponentProps) {
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || `content-stretch flex gap-[4.655px] h-[25px] items-center px-[4.655px] relative w-[265.309px] ${isVariant2 ? "bg-[#e9e9e9] overflow-clip rounded-[25px]" : ""}`}>
      <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
        <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
          <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
              <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
        <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
          <div className={`content-stretch flex items-center px-[9.309px] relative size-full ${isVariant2 ? "" : "gap-[4.655px]"}`}>
            <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal] overflow-hidden">F-7.5.13-63 Pluritec EVO 2S</p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
        <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={isVariant2 ? "0 0 18 18" : "0 0 8.37818 8.37818"}>
            <path d={isVariant2 ? svgPaths.p95dad60 : svgPaths.p7c6ea80} fill={isVariant2 ? "var(--fill-0, white)" : "var(--fill-0, #36415D)"} id="Icon/Search" />
          </svg>
        </div>
      </div>
      <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
        <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
          <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
              <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
            </svg>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
        <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
          <div className={`absolute ${isVariant2 ? "inset-[0_-0.15%_0_-0.11%]" : "inset-[-0.2%_-0.29%_-0.2%_-0.22%]"}`}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={isVariant2 ? "0 0 16.0409 18.0352" : "0 0 8.04086 9.03522"}>
              <path clipRule="evenodd" d={isVariant2 ? svgPaths.p36f17f00 : svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartsCatalog({ className }: { className?: string }) {
  return (
    <div className={className || "bg-white content-stretch flex flex-col gap-[10px] h-[816px] items-center overflow-clip p-[10px] relative rounded-[9.309px] shadow-[0px_1.862px_9.123px_0px_rgba(0,0,0,0.55)] w-[303px]"} data-name="Parts Catalog">
      <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-name="Header">
        <div className="flex flex-row items-center self-stretch">
          <div className="h-full overflow-clip relative shrink-0 w-[83px]" data-name="Title">
            <div className="-translate-x-1/2 absolute bottom-0 flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal justify-center leading-[0] left-[41.5px] text-[#36415d] text-[12px] text-center top-0 w-[83px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[normal] whitespace-pre-wrap">Parts catalog</p>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center self-stretch">
          <div className="bg-[#c2c9db] h-full rounded-[25px] shrink-0 w-px" />
        </div>
        <div className="h-[30px] relative shrink-0 w-[50px]" data-name="Primary Button Group">
          <div className="absolute inset-0 rounded-[200px]" />
          <div className="absolute flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal inset-[24.44%_9.73%_24.44%_9.15%] justify-center leading-[0] text-[#36415d] text-[12px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Tools</p>
          </div>
        </div>
        <div className="flex-[1_0_0] h-[8px] min-h-px min-w-px" data-name="Spacer" />
        <button className="block cursor-pointer relative shrink-0 size-[24px]" data-name="Icon/Escape">
          <div className="absolute contents inset-[20.83%]" data-name="Icon/Escape">
            <div className="absolute inset-[20.83%]" data-name="close">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path d={svgPaths.p2aa77200} fill="var(--fill-0, white)" />
              </svg>
            </div>
          </div>
        </button>
      </div>
      <div className="bg-[#c2c9db] h-px shrink-0 w-[303px]" data-name="Divider" />
      <div className="content-stretch flex gap-[8px] h-[30px] items-center relative shrink-0 w-full" data-name="Search">
        <div className="bg-[#c2c9db] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Frontline Search Input Field">
          <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-between p-[6px] relative size-full">
              <button className="cursor-pointer flex flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-full justify-center leading-[0] overflow-hidden relative shrink-0 text-[#36415d] text-[6.52px] text-ellipsis text-left w-[94.953px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[normal] overflow-hidden">Search for part...</p>
              </button>
              <div className="relative shrink-0 size-[16px]" data-name="Icon/Search">
                <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.58545 5.58545">
                    <path d={svgPaths.p26115f00} fill="var(--fill-0, #36415D)" id="Icon/Search" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#2e80ed] border-solid inset-0 pointer-events-none rounded-[18.618px]" />
        </div>
        <div className="overflow-clip relative shrink-0 size-[24px]">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.23px)] size-[16px] top-1/2" data-name="Icon/Filter">
            <div className="absolute inset-[16.9%_17.91%_16.43%_15.25%]" data-name="filter_alt">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6941 10.6667">
                <path d={svgPaths.p3cf7aa80} fill="var(--fill-0, #36415D)" id="filter_alt" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#c2c9db] h-px shrink-0 w-[303px]" data-name="Divider" />
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] items-end min-h-px min-w-px overflow-x-clip overflow-y-auto relative w-full" data-name="Parts list">
        <PartItemComponent className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" />
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.1.3-71-2 LENZ DRILL</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative shrink-0 size-[5.2px]" data-name="🔹 Icon/Digital Twin/Default">
            <div className="absolute inset-[12.19%_12.29%_12.81%_12.5%]" data-name="Vector">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.40144 8.37818">
                <path d={svgPaths.p254ab500} fill="var(--fill-0, #36415D)" id="Vector" />
              </svg>
            </div>
          </div>
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-13 Accuprint AP30 I-L</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-49 Precious Metals ENIG Line</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.1.3-01 PumiFlex SHD 2000</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-74 FluoroEtch Line</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-72 Micro Vu Excel 1601 UM</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-60 Plasma</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-28 Orbotech Discovery II 8800 AOI</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-43 DMVL-1230 O-L 231</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[#e9e9e9] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-09 Multi-Station # 7</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative rounded-[25px] shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-38 Deburr</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="absolute inset-[0_-0.07%_0_0] rounded-[18.618px]" data-name="Xrayed Indication">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18.618px] size-full" src={img} />
                </div>
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-29 Morton Auto.Lam. 1600-D</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px opacity-50 overflow-hidden relative text-[#7f7f7f] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-34 Stripper</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #7F7F7F)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="bg-white relative shrink-0 size-[5.2px]" data-name="Icon/Eye Disabled">
            <div className="absolute contents inset-[11.67%_4.17%_5.83%_4.17%]" data-name="Icon/Eye Disabled">
              <div className="absolute contents inset-[11.67%_4.17%_5.83%_4.17%]" data-name="visibility_off">
                <div className="absolute inset-[11.67%_4.17%_5.83%_4.17%]" data-name="visibility_off">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19.8">
                    <path d={svgPaths.p10afe940} fill="var(--fill-0, white)" id="visibility_off" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-45 Reflow, ASI, Post Clean Machine</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-62 LPISM Spray Coater 9524</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#8404b3] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-41 Lamination Press 1</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-36 Developer</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">{`F-7.5.13-72 Orbotech Nuvogo 600 \"LDI\"`}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">{`F-7.5.13-27 Colight-1600 I-L `}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-55 Chemical Storage Building</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-22 Resist Stripper</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-65 O-L White Tin</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-40 Plasma</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-23 Tinlead Tank # 1</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.1.3-31 ProStar Film Processor</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-10 Multi-Station # 8</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13-17 Outer Layer Etch</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4.655px] h-[25px] items-center overflow-clip px-[4.655px] relative shrink-0 w-[265.309px]" data-name="Part Item Component">
          <div className="relative rounded-[3px] shrink-0 size-[5.2px]" data-name="Icon/Chevron/Collapsed">
            <div className="absolute contents inset-[18.44%_31.58%_14.89%_29.17%]" data-name="Icon/Chevron">
              <div className="absolute inset-[18.44%_31.58%_14.89%_29.17%]" data-name="arrow_forward_ios">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.42 16">
                  <path d={svgPaths.pcfe2600} fill="var(--fill-0, white)" id="arrow_forward_ios" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(217,224,240,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[18.618px]" data-name="Part Name">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[4.655px] items-center px-[9.309px] relative size-full">
                <div className="flex flex-[1_0_0] flex-col font-['Open_Sans:Regular',sans-serif] font-normal h-[14.895px] justify-center leading-[0] min-h-px min-w-px overflow-hidden relative text-[#36415d] text-[12px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <p className="leading-[normal] overflow-hidden">F-7.5.13 -58 RWASTE TREATMENT O-L</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Search">
            <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-[12.5%] left-1/2 top-[12.5%]" data-name="Icon/Search">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.37818 8.37818">
                <path d={svgPaths.p7c6ea80} fill="var(--fill-0, #36415D)" id="Icon/Search" />
              </svg>
            </div>
          </div>
          <div className="relative shrink-0 size-[5.2px]" data-name="Icon/Eye">
            <div className="absolute contents inset-[16.67%_4.17%_20.83%_4.17%]" data-name="Icon/Eye">
              <div className="absolute inset-[16.67%_4.17%_20.83%_4.17%]" data-name="visibility">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
                  <path d={svgPaths.p2c71b400} fill="var(--fill-0, white)" id="visibility" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 size-[12px]" data-name="Icon/Xray">
            <div className="absolute inset-[12.5%_16.67%]" data-name="xray">
              <div className="absolute inset-[-0.2%_-0.29%_-0.2%_-0.22%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.04086 9.03522">
                  <path clipRule="evenodd" d={svgPaths.p1554f600} fill="var(--fill-0, white)" fillRule="evenodd" id="xray" stroke="var(--stroke-0, white)" strokeWidth="0.0351562" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#c2c9db] h-px shrink-0 w-[303px]" data-name="Divider" />
      <div className="bg-[rgba(217,224,240,0)] h-[49px] overflow-clip relative rounded-[4.655px] shrink-0 w-[283px]">
        <div className="absolute left-[22.34px] size-[11.171px] top-[18.62px]" data-name="Icon/More">
          <div className="-translate-x-1/2 absolute aspect-[1.3963636457920074/5.58545458316803] bottom-1/4 flex items-center justify-center left-1/2 top-1/4">
            <div className="flex-none h-[1.396px] rotate-90 w-[5.585px]">
              <div className="relative size-full" data-name="more_horiz">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.58545 1.39636">
                  <path d={svgPaths.p8b60e00} fill="var(--fill-0, #36415D)" id="more_horiz" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute content-stretch flex font-['Open_Sans:Regular',sans-serif] font-normal h-[15px] items-center justify-between leading-[0] left-[132.31px] p-[4.655px] text-[#36415d] text-[12px] top-[27.69px] w-[120px]" data-name="Selected PArts">
          <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center left-0 top-[7.5px] w-[103px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Selected Parts</p>
          </div>
          <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center right-0 text-right top-[7.5px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">0</p>
          </div>
        </div>
        <div className="absolute content-stretch flex font-['Open_Sans:Regular',sans-serif] font-normal h-[15px] items-center justify-between leading-[0] left-[132.31px] p-[4.655px] text-[#36415d] text-[12px] top-[3.69px] w-[120px]" data-name="Total Parts">
          <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center left-0 top-[7.5px] w-[81px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">Total Parts</p>
          </div>
          <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center right-0 text-right top-[7.5px] w-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[normal] whitespace-pre-wrap">242</p>
          </div>
        </div>
      </div>
    </div>
  );
}