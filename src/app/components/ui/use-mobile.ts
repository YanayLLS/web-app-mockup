import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const update = (overrideWidth?: number | null) => {
      const effectiveWidth = overrideWidth ?? window.innerWidth;
      setIsMobile(effectiveWidth < MOBILE_BREAKPOINT);
    };

    const onMediaChange = () => update();

    const onDebugViewport = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      update(detail?.width ?? null);
    };

    mql.addEventListener("change", onMediaChange);
    window.addEventListener("debug-viewport", onDebugViewport);
    update();

    return () => {
      mql.removeEventListener("change", onMediaChange);
      window.removeEventListener("debug-viewport", onDebugViewport);
    };
  }, []);

  return !!isMobile;
}
