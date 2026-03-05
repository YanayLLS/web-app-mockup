import svgPaths from "./svg-ol3afibivi";
import { imgDragIndicator2, imgClose2 } from "./svg-t3b4o";

function Button() {
  return (
    <div className="bg-[#2f80ed] h-[44.985px] relative rounded-[10px] shrink-0 w-[161.265px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[80.99px] text-[14px] text-center text-white top-[11.8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Open Bookmarks
        </p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#11e874] flex-[1_0_0] h-[44.985px] min-h-px min-w-px relative rounded-[10px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[98.99px] text-[14px] text-center text-white top-[11.8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          View BDD Specification
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[44.985px] relative shrink-0 w-[375.076px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.99px] items-start relative size-full">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex flex-col h-[1036.29px] items-center justify-center left-0 top-0 w-[2335.484px]" data-name="App">
      <Container />
    </div>
  );
}

function TabsHeader1() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[236.013px]" data-name="TabsHeader">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[118.02px] text-[#2f80ed] text-[14px] text-center top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          My Bookmarks
        </p>
      </div>
    </div>
  );
}

function SlotClone() {
  return (
    <div className="absolute content-stretch flex flex-col h-[43.989px] items-start justify-center left-0 pb-[1.613px] top-0 w-[236.013px]" data-name="SlotClone">
      <div aria-hidden="true" className="absolute border-[#2f80ed] border-b-[1.613px] border-solid inset-0 pointer-events-none" />
      <TabsHeader1 />
    </div>
  );
}

function TabsHeader2() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[236.013px]" data-name="TabsHeader">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[118.38px] text-[#7f7f7f] text-[14px] text-center top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Public bookmarks
        </p>
      </div>
    </div>
  );
}

function SlotClone1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[43.989px] items-start justify-center left-[244px] pb-[1.613px] top-0 w-[236.013px]" data-name="SlotClone">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0)] border-b-[1.613px] border-solid inset-0 pointer-events-none" />
      <TabsHeader2 />
    </div>
  );
}

function TabsHeader() {
  return (
    <div className="absolute border-[#e9e9e9] border-b-[1.613px] border-solid h-[43.611px] left-[20px] top-[89.59px] w-[480.003px]" data-name="TabsHeader">
      <SlotClone />
      <SlotClone1 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[19.63%_12.5%]" data-name="Group">
      <div className="absolute inset-[19.63%_12.5%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.4955 10.9314">
          <path clipRule="evenodd" d={svgPaths.p3dceff00} fill="var(--fill-0, #36415D)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[17.994px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function IconFolder() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[10.19px] size-[17.994px] top-[10.19px]" data-name="IconFolder">
      <Icon />
    </div>
  );
}

function SlotClone2() {
  return (
    <div className="absolute bg-[#e9e9e9] border-[#e9e9e9] border-[0.806px] border-solid left-[392.02px] rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] size-[39.995px] top-0" data-name="SlotClone">
      <IconFolder />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6008 14.4153">
        <path d={svgPaths.p16fa3b80} fill="var(--fill-0, white)" id="bookmark" />
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[14.415px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group1 />
    </div>
  );
}

function IconBookmark() {
  return (
    <div className="absolute content-stretch flex flex-col h-[14.415px] items-start left-[13.7px] top-[12.79px] w-[12.601px]" data-name="IconBookmark">
      <Icon1 />
    </div>
  );
}

function SlotClone3() {
  return (
    <div className="absolute bg-[#2f80ed] left-[440.01px] rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] size-[39.995px] top-0" data-name="SlotClone">
      <IconBookmark />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute content-stretch flex h-[20.993px] items-center left-[43.98px] overflow-clip top-[7.89px] w-[320.842px]" data-name="Text Input">
      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#7f7f7f] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Search bookmarks...
      </p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[15.99px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9904 15.9904">
        <path d={svgPaths.p24550af0} fill="var(--fill-0, #7F7F7F)" id="Vector" />
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[15.99px] size-[15.99px] top-[10.38px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[36.769px] left-0 top-0 w-[380.809px]" data-name="Container">
      <TextInput />
      <Container4 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[36.769px] relative shrink-0 w-full" data-name="Container">
      <Container3 />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[39.995px] items-start left-0 p-[1.613px] rounded-[8px] top-0 w-[384.035px]" data-name="SearchBar">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-[1.613px] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container2 />
    </div>
  );
}

function SearchAndActions() {
  return (
    <div className="absolute h-[39.995px] left-[20px] top-[149.19px] w-[480.003px]" data-name="SearchAndActions">
      <SlotClone2 />
      <SlotClone3 />
      <SearchBar />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[26.991px] left-[33.97px] top-[7.99px] w-[83.203px]" data-name="Heading 3">
      <p className="absolute font-['Open_Sans:Bold',sans-serif] font-bold leading-[27px] left-0 text-[#36415d] text-[18px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Favorites
      </p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[15.99px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[16.61%_15.33%_14.35%_15.32%]" data-name="Vector">
        <div className="absolute inset-[-26.53%_-23.33%_-21.12%_-23.34%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.2659 16.3001">
            <path d={svgPaths.p1eb5f300} fill="var(--fill-0, #2F80ED)" id="Vector" stroke="var(--stroke-0, #2F80ED)" strokeWidth="2.1627" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] size-[15.99px] top-[13.48px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[42.969px] relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Container7 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[14.655px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 top-0 w-[11.681px]" data-name="bookmark_add">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6809 14.6547">
          <path d={svgPaths.p1640f800} fill="var(--fill-0, #2F80ED)" id="bookmark_add" />
        </svg>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col h-[14.655px] items-start left-[3.33px] top-[5.86px] w-[11.681px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[9.173px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-[14.35%] left-1/2 top-[16.61%] w-[6.816px]">
        <div className="absolute inset-[-34.52%_-31.66%_-28.13%_-31.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1333 10.3013">
            <path d={svgPaths.p15cdd900} fill="var(--fill-0, #2F80ED)" id="Star 7" stroke="var(--stroke-0, #2F80ED)" strokeWidth="1.71232" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col h-[9.173px] items-start left-[9.25px] top-[1.07px] w-[9.829px]" data-name="Container">
      <Icon5 />
    </div>
  );
}

function IconBookmarkOutline() {
  return (
    <div className="h-[21.963px] relative shrink-0 w-full" data-name="IconBookmarkOutline">
      <Container9 />
      <Container10 />
    </div>
  );
}

function SlotClone4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] pl-[3.994px] pt-[0.441px] size-[23.992px] top-[6px]" data-name="SlotClone">
      <IconBookmarkOutline />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[294.745px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Spare Parts Overview
        </p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[41.97px] top-[7.5px] w-[294.745px]" data-name="Container">
      <Paragraph />
    </div>
  );
}

function FavoriteBookmarkItem() {
  return (
    <div className="absolute h-[35.988px] left-0 rounded-[8px] top-0 w-[466.394px]" data-name="FavoriteBookmarkItem">
      <SlotClone4 />
      <Container11 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[14.655px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 top-0 w-[11.681px]" data-name="bookmark_add">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6809 14.6547">
          <path d={svgPaths.p1640f800} fill="var(--fill-0, #2F80ED)" id="bookmark_add" />
        </svg>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col h-[14.655px] items-start left-[3.33px] top-[5.86px] w-[11.681px]" data-name="Container">
      <Icon6 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[9.173px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-[14.35%] left-1/2 top-[16.61%] w-[6.816px]">
        <div className="absolute inset-[-34.52%_-31.66%_-28.13%_-31.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1333 10.3013">
            <path d={svgPaths.p15cdd900} fill="var(--fill-0, #2F80ED)" id="Star 7" stroke="var(--stroke-0, #2F80ED)" strokeWidth="1.71232" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col h-[9.173px] items-start left-[9.25px] top-[1.07px] w-[9.829px]" data-name="Container">
      <Icon7 />
    </div>
  );
}

function IconBookmarkOutline1() {
  return (
    <div className="h-[21.963px] relative shrink-0 w-full" data-name="IconBookmarkOutline">
      <Container12 />
      <Container13 />
    </div>
  );
}

function SlotClone5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] pl-[3.994px] pt-[0.441px] size-[23.992px] top-[6px]" data-name="SlotClone">
      <IconBookmarkOutline1 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[294.745px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          API Reference
        </p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[41.97px] top-[7.5px] w-[294.745px]" data-name="Container">
      <Paragraph1 />
    </div>
  );
}

function FavoriteBookmarkItem1() {
  return (
    <div className="absolute h-[35.988px] left-0 rounded-[8px] top-[36.98px] w-[466.394px]" data-name="FavoriteBookmarkItem">
      <SlotClone5 />
      <Container14 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[72.971px] relative shrink-0 w-full" data-name="Container">
      <FavoriteBookmarkItem />
      <FavoriteBookmarkItem1 />
    </div>
  );
}

function Container15() {
  return <div className="bg-[#e9e9e9] h-[0.995px] shrink-0 w-full" data-name="Container" />;
}

function FavoritesSection() {
  return (
    <div className="absolute content-stretch flex flex-col h-[140.927px] items-start left-[6px] top-[6px] w-[466.394px]" data-name="FavoritesSection">
      <Container6 />
      <Container8 />
      <Container15 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6008 14.4153">
        <path d={svgPaths.p16fa3b80} fill="var(--fill-0, #2F80ED)" id="bookmark" />
      </svg>
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[14.415px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group2 />
    </div>
  );
}

function IconBookmarkOutline2() {
  return (
    <div className="content-stretch flex flex-col h-[14.415px] items-start relative shrink-0 w-full" data-name="IconBookmarkOutline">
      <Icon8 />
    </div>
  );
}

function SlotClone6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] opacity-60 pt-[1.789px] px-[2.697px] size-[17.994px] top-[9px]" data-name="SlotClone">
      <IconBookmarkOutline2 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[272.744px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Team Guidelines
        </p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[35.98px] top-[7.5px] w-[272.744px]" data-name="Container">
      <Paragraph2 />
    </div>
  );
}

function DraggableItem() {
  return (
    <div className="absolute h-[35.988px] left-[28px] rounded-[8px] top-0 w-[438.395px]" data-name="DraggableItem">
      <SlotClone6 />
      <Container16 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[14.655px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 top-0 w-[11.681px]" data-name="bookmark_add">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6809 14.6547">
          <path d={svgPaths.p1640f800} fill="var(--fill-0, #2F80ED)" id="bookmark_add" />
        </svg>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col h-[14.655px] items-start left-[3.33px] top-[5.86px] w-[11.681px]" data-name="Container">
      <Icon9 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="h-[9.173px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-[14.35%] left-1/2 top-[16.61%] w-[6.816px]">
        <div className="absolute inset-[-34.52%_-31.66%_-28.13%_-31.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1333 10.3013">
            <path d={svgPaths.p15cdd900} fill="var(--fill-0, #2F80ED)" id="Star 7" stroke="var(--stroke-0, #2F80ED)" strokeWidth="1.71232" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex flex-col h-[9.173px] items-start left-[9.25px] top-[1.07px] w-[9.829px]" data-name="Container">
      <Icon10 />
    </div>
  );
}

function IconBookmarkOutline3() {
  return (
    <div className="h-[21.963px] relative shrink-0 w-full" data-name="IconBookmarkOutline">
      <Container17 />
      <Container18 />
    </div>
  );
}

function SlotClone7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] pl-[3.994px] pt-[0.441px] size-[23.992px] top-[6px]" data-name="SlotClone">
      <IconBookmarkOutline3 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[266.746px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          API Reference
        </p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[41.97px] top-[7.5px] w-[266.746px]" data-name="Container">
      <Paragraph3 />
    </div>
  );
}

function DraggableItem1() {
  return (
    <div className="absolute h-[35.988px] left-[28px] rounded-[8px] top-[35.99px] w-[438.395px]" data-name="DraggableItem">
      <SlotClone7 />
      <Container19 />
    </div>
  );
}

function FolderListItem() {
  return (
    <div className="absolute h-[71.976px] left-[6px] top-[278.84px] w-[466.394px]" data-name="FolderListItem">
      <DraggableItem />
      <DraggableItem1 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="h-[14.655px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-0 left-1/2 top-0 w-[11.681px]" data-name="bookmark_add">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6809 14.6547">
          <path d={svgPaths.p1640f800} fill="var(--fill-0, #2F80ED)" id="bookmark_add" />
        </svg>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col h-[14.655px] items-start left-[3.33px] top-[5.86px] w-[11.681px]" data-name="Container">
      <Icon11 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[9.173px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="-translate-x-1/2 absolute bottom-[14.35%] left-1/2 top-[16.61%] w-[6.816px]">
        <div className="absolute inset-[-34.52%_-31.66%_-28.13%_-31.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1333 10.3013">
            <path d={svgPaths.p15cdd900} fill="var(--fill-0, #2F80ED)" id="Star 7" stroke="var(--stroke-0, #2F80ED)" strokeWidth="1.71232" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col h-[9.173px] items-start left-[9.25px] top-[1.07px] w-[9.829px]" data-name="Container">
      <Icon12 />
    </div>
  );
}

function IconBookmarkOutline4() {
  return (
    <div className="h-[21.963px] relative shrink-0 w-full" data-name="IconBookmarkOutline">
      <Container20 />
      <Container21 />
    </div>
  );
}

function SlotClone8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] pl-[3.994px] pt-[0.441px] size-[23.992px] top-[6px]" data-name="SlotClone">
      <IconBookmarkOutline4 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[294.745px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Spare Parts Overview
        </p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[41.97px] top-[7.5px] w-[294.745px]" data-name="Container">
      <Paragraph4 />
    </div>
  );
}

function DraggableItem2() {
  return (
    <div className="absolute h-[35.988px] left-[6px] rounded-[8px] top-[163.91px] w-[466.394px]" data-name="DraggableItem">
      <SlotClone8 />
      <Container22 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6008 14.4153">
        <path d={svgPaths.p16fa3b80} fill="var(--fill-0, #2F80ED)" id="bookmark" />
      </svg>
    </div>
  );
}

function Icon13() {
  return (
    <div className="h-[14.415px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group3 />
    </div>
  );
}

function IconBookmarkOutline5() {
  return (
    <div className="content-stretch flex flex-col h-[14.415px] items-start relative shrink-0 w-full" data-name="IconBookmarkOutline">
      <Icon13 />
    </div>
  );
}

function SlotClone9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.99px] opacity-60 pt-[1.789px] px-[2.697px] size-[17.994px] top-[9px]" data-name="SlotClone">
      <IconBookmarkOutline5 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[300.743px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Documentation Hub
        </p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[35.98px] top-[7.5px] w-[300.743px]" data-name="Container">
      <Paragraph5 />
    </div>
  );
}

function DraggableItem3() {
  return (
    <div className="absolute h-[35.988px] left-[6px] rounded-[8px] top-[200.89px] w-[466.394px]" data-name="DraggableItem">
      <SlotClone9 />
      <Container23 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="h-[11.996px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-33.33%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99731 4.99832">
            <path d={svgPaths.p15f2ae00} id="Vector" stroke="var(--stroke-0, #7F7F7F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99933" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[11.996px] top-[3.99px]" data-name="Container">
      <Icon14 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[19.63%_12.5%]" data-name="Group">
      <div className="absolute inset-[19.63%_12.5%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9981 12.1485">
          <path clipRule="evenodd" d={svgPaths.p239c0d00} fill="var(--fill-0, #2F80ED)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="h-[19.997px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group4 />
    </div>
  );
}

function IconFolderOutline() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[17.99px] size-[19.997px] top-0" data-name="IconFolderOutline">
      <Icon15 />
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[19.997px] left-[9.99px] top-[8.98px] w-[37.991px]" data-name="Container">
      <Container25 />
      <IconFolderOutline />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[364.441px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-0 text-[#36415d] text-[14px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Project Resources
        </p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col h-[20.993px] items-start justify-center left-[55.97px] top-[8.49px] w-[364.441px]" data-name="Container">
      <Paragraph6 />
    </div>
  );
}

function DraggableItem4() {
  return (
    <div className="absolute h-[37.979px] left-[6px] rounded-[8px] top-[237.88px] w-[466.394px]" data-name="DraggableItem">
      <Container24 />
      <Container26 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[429.587px] left-0 overflow-clip top-0 w-[478.39px]" data-name="Container">
      <FavoritesSection />
      <FolderListItem />
      <DraggableItem2 />
      <DraggableItem3 />
      <DraggableItem4 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[21px] left-[227.55px] text-[#7f7f7f] text-[14px] text-center top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Hold Ctrl (⌘ on Mac) to select multiple items
      </p>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex flex-col h-[33.795px] items-start left-0 pt-[6.804px] px-[11.996px] top-[429.59px] w-[478.39px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t-[0.806px] inset-0 pointer-events-none" />
      <Paragraph7 />
    </div>
  );
}

function BookmarksList() {
  return (
    <div className="absolute bg-white border-[#e9e9e9] border-[0.806px] border-solid h-[464.995px] left-[20px] rounded-[10px] top-[205.18px] w-[480.003px]" data-name="BookmarksList">
      <Container5 />
      <Container27 />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[36.001px] left-[55.99px] top-0 w-[136.505px]" data-name="Heading 2">
      <p className="absolute font-['Open_Sans:Bold',sans-serif] font-bold leading-[36px] left-0 text-[#36415d] text-[24px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Bookmarks
      </p>
    </div>
  );
}

function Container28() {
  return <div className="absolute h-[11.996px] left-[208.48px] top-[12px] w-[255.532px]" data-name="Container" />;
}

function Group5() {
  return (
    <div className="absolute contents inset-[16.67%_29.17%]" data-name="Group">
      <div className="absolute inset-[16.67%_29.17%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-5.833px_-3.333px] mask-size-[19.997px_19.997px]" data-name="drag_indicator_2" style={{ maskImage: `url('${imgDragIndicator2}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33225 13.3316">
          <path d={svgPaths.p18690e00} fill="var(--fill-0, #36415D)" id="drag_indicator_2" />
        </svg>
      </div>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Mask group">
      <Group5 />
    </div>
  );
}

function DragIndicator1() {
  return (
    <div className="absolute contents inset-0" data-name="drag_indicator">
      <MaskGroup />
    </div>
  );
}

function DragIndicator() {
  return (
    <div className="h-[19.997px] overflow-clip relative shrink-0 w-full" data-name="DragIndicator">
      <DragIndicator1 />
    </div>
  );
}

function SlotClone10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[20px] opacity-40 size-[19.997px] top-[8px]" data-name="SlotClone">
      <DragIndicator />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents inset-[20.83%]" data-name="Group">
      <div className="absolute inset-[20.83%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.337px_-3.337px] mask-size-[16.016px_16.016px]" data-name="close_2" style={{ maskImage: `url('${imgClose2}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34247 9.34247">
          <path d={svgPaths.p540d980} fill="var(--fill-0, #36415D)" id="close_2" />
        </svg>
      </div>
    </div>
  );
}

function MaskGroup1() {
  return (
    <div className="absolute contents inset-0" data-name="Mask group">
      <Group7 />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <MaskGroup1 />
    </div>
  );
}

function Close() {
  return (
    <div className="h-[16.016px] overflow-clip relative shrink-0 w-full" data-name="Close">
      <Group6 />
    </div>
  );
}

function SlotClone11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[480px] pt-[1.991px] px-[1.991px] rounded-[6px] size-[19.997px] top-[8px]" data-name="SlotClone">
      <Close />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute border-[#e9e9e9] border-b-[1.613px] border-solid h-[53.604px] left-0 top-[20px] w-[519.997px]" data-name="Header">
      <Heading />
      <Container28 />
      <SlotClone10 />
      <SlotClone11 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-white h-[700px] left-[907.74px] rounded-[14px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.3)] top-[168.15px] w-[519.997px]" data-name="Container">
      <TabsHeader />
      <SearchAndActions />
      <BookmarksList />
      <Header />
    </div>
  );
}

function BookmarksModalContent() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.6)] h-[1036.29px] left-0 top-0 w-[2335.484px]" data-name="BookmarksModalContent">
      <Container1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[26.991px] left-[20px] top-[20px] w-[221.623px]" data-name="Heading 3">
      <p className="absolute font-['Open_Sans:Bold',sans-serif] font-bold leading-[27px] left-0 text-[#36415d] text-[18px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Debug: Permission Mode
      </p>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#e9e9e9] h-[36.971px] relative rounded-[8px] shrink-0 w-[221.623px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[111.16px] text-[#36415d] text-[14px] text-center top-[7.8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Guest
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#e9e9e9] h-[36.971px] relative rounded-[8px] shrink-0 w-[221.623px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[111.08px] text-[#36415d] text-[14px] text-center top-[7.8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          User
        </p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#2f80ed] h-[36.971px] relative rounded-[8px] shrink-0 w-[221.623px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[111.2px] text-[14px] text-center text-white top-[7.8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Content Creator
        </p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.989px] h-[126.89px] items-start left-[20px] top-[58.98px] w-[221.623px]" data-name="Container">
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[17.994px] left-[20px] top-[197.87px] w-[221.623px]" data-name="Container">
      <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#7f7f7f] text-[12px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Full editing permissions
      </p>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[26.991px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Open_Sans:Bold',sans-serif] font-bold leading-[27px] left-0 text-[#36415d] text-[18px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Offline Mode
      </p>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#e9e9e9] h-[36.971px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[110.9px] text-[#36415d] text-[14px] text-center top-[7.8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Offline
      </p>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[17.994px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#7f7f7f] text-[12px] top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        All features available
      </p>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.996px] h-[118.737px] items-start left-[20px] pt-[16.797px] top-[231.85px] w-[221.623px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t-[0.806px] inset-0 pointer-events-none" />
      <Heading3 />
      <Button5 />
      <Container32 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[15.99px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9904 15.9904">
        <g clipPath="url(#clip0_9_204)" id="Icon">
          <path d={svgPaths.p17bd6b80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33254" />
          <path d={svgPaths.p29ea3990} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33254" />
        </g>
        <defs>
          <clipPath id="clip0_9_204">
            <rect fill="white" height="15.9904" width="15.9904" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[110.786px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[55.5px] text-[14px] text-center text-white top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Copy Folder BDD
        </p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#11e874] h-[36.971px] relative rounded-[8px] shrink-0 w-[221.623px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.989px] items-center justify-center pr-[0.012px] relative size-full">
        <Icon16 />
        <Text />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[15.99px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9904 15.9904">
        <g clipPath="url(#clip0_9_204)" id="Icon">
          <path d={svgPaths.p17bd6b80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33254" />
          <path d={svgPaths.p29ea3990} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33254" />
        </g>
        <defs>
          <clipPath id="clip0_9_204">
            <rect fill="white" height="15.9904" width="15.9904" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20.993px] relative shrink-0 w-[100.718px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[21px] left-[50.5px] text-[14px] text-center text-white top-[-0.19px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Copy Drag BDD
        </p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#11e874] h-[36.971px] relative rounded-[8px] shrink-0 w-[221.623px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.989px] items-center justify-center relative size-full">
        <Icon17 />
        <Text1 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.989px] h-[98.727px] items-start left-[20px] pt-[16.796px] top-[366.58px] w-[221.623px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t-[0.806px] inset-0 pointer-events-none" />
      <Button6 />
      <Button7 />
    </div>
  );
}

function App1() {
  return (
    <div className="absolute bg-white border-[#e9e9e9] border-[1.613px] border-solid h-[488.533px] left-[2050.64px] rounded-[10px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.4)] top-[20px] w-[264.844px]" data-name="App">
      <Heading2 />
      <Container29 />
      <Container30 />
      <Container31 />
      <Container33 />
    </div>
  );
}

export default function InteractiveBookmarksModal() {
  return (
    <div className="bg-[#f5f5f5] relative size-full" data-name="Interactive Bookmarks Modal">
      <App />
      <BookmarksModalContent />
      <App1 />
    </div>
  );
}