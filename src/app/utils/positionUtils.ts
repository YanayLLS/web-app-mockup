/**
 * Calculates the optimal position for a context menu to prevent it from going off-screen
 * @param triggerRect - The bounding rect of the element that triggered the menu
 * @param menuWidth - The width of the menu
 * @param menuHeight - The estimated height of the menu
 * @returns The optimal position {top, left, right}
 */
export function calculateMenuPosition(
  triggerRect: DOMRect,
  menuWidth: number,
  menuHeight: number
): { top: number; left?: number; right?: number } {
  const padding = 8; // Distance from trigger element
  const edgePadding = 16; // Minimum distance from screen edge
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let top = triggerRect.bottom + padding;
  let left = triggerRect.left;
  let right: number | undefined = undefined;

  // Check if menu goes below viewport
  if (top + menuHeight > windowHeight - edgePadding) {
    // Open above if there's more space
    if (triggerRect.top - menuHeight - padding > edgePadding) {
      top = triggerRect.top - menuHeight - padding;
    } else {
      // Keep it at bottom but adjust to fit
      top = Math.max(edgePadding, windowHeight - menuHeight - edgePadding);
    }
  }

  // Check if menu goes off right edge
  if (left + menuWidth > windowWidth - edgePadding) {
    // Align to right edge of trigger instead
    left = triggerRect.right - menuWidth;
    
    // If still doesn't fit, use right positioning
    if (left < edgePadding) {
      left = undefined as any;
      right = windowWidth - triggerRect.right;
    }
  }

  // Check if menu goes off left edge
  if (left !== undefined && left < edgePadding) {
    left = edgePadding;
  }

  return { top, left, right };
}
