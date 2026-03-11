import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to detect clicks outside of one or more elements.
 *
 * @param refs - Single ref or array of refs to treat as "inside" (clicks on these won't trigger callback)
 * @param callback - Called when a click outside all refs is detected
 * @param isActive - Only listen when true (default: true)
 * @param delayed - Use setTimeout(0) to defer listener registration, preventing the opening click from immediately closing (default: false)
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  callback: () => void,
  isActive: boolean = true,
  delayed: boolean = false
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const refsArray = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const isOutside = refsArray.every(
        ref => !ref.current || !ref.current.contains(event.target as Node)
      );
      if (isOutside) {
        callbackRef.current();
      }
    };

    if (delayed) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isActive, delayed]);
}
