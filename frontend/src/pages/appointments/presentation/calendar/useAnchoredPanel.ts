import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Floating panels of the calendar (appointment details, lists of appointments) open next to the
// element that was clicked; on phones they are bottom sheets instead

const GAP = 8;
const VIEWPORT_MARGIN = 8;
// Below Tailwind's `sm` the panel is a bottom sheet instead of floating next to the appointment
const SM_BREAKPOINT = 640;

type Position = { left: number; top: number };

// Beside the appointment when there is room (right first, then left), otherwise below or above it,
// always kept inside the viewport
function positionNextTo(anchor: DOMRect, panel: DOMRect): Position {
  const maxLeft = window.innerWidth - panel.width - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - panel.height - VIEWPORT_MARGIN;
  const clamp = (value: number, max: number) => Math.max(VIEWPORT_MARGIN, Math.min(value, max));

  if (anchor.right + GAP + panel.width <= window.innerWidth - VIEWPORT_MARGIN) {
    return { left: anchor.right + GAP, top: clamp(anchor.top, maxTop) };
  }
  if (anchor.left - GAP - panel.width >= VIEWPORT_MARGIN) {
    return { left: anchor.left - GAP - panel.width, top: clamp(anchor.top, maxTop) };
  }
  const below = anchor.bottom + GAP;
  const top = below + panel.height <= window.innerHeight - VIEWPORT_MARGIN ? below : anchor.top - GAP - panel.height;
  return { left: clamp(anchor.left, maxLeft), top: clamp(top, maxTop) };
}

// Keeps the panel next to the clicked element while the calendar scrolls, the window
// resizes or the panel grows (e.g. the delete confirmation)
export function useAnchoredPanel(anchor: HTMLElement | null, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth < SM_BREAKPOINT);
  const floating = anchor !== null && !isSmallScreen;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!floating || !panel) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // The element can re-render away (e.g. after a refresh): stay where it was
        if (!anchor.isConnected) return;
        setPosition(positionNextTo(anchor.getBoundingClientRect(), panel.getBoundingClientRect()));
      });
    };
    // First placement before paint, so the panel doesn't flash in the wrong place
    setPosition(positionNextTo(anchor.getBoundingClientRect(), panel.getBoundingClientRect()));
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(panel);
    // Capture scrolls of any container, not only the window
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchor, floating]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < SM_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handlePointerDown = (pointerEvent: PointerEvent) => {
      if (panelRef.current?.contains(pointerEvent.target as Node)) return;
      // Clicking the same appointment again is handled by its own click
      if (anchor?.contains(pointerEvent.target as Node)) return;
      onClose();
    };
    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchor, onClose]);

  return { panelRef, floating, isSmallScreen, position };
}


// Classes and inline style for the three placements: bottom sheet, floating, or the fallback spot
export function anchoredPanelLayout(
  { floating, isSmallScreen, position }: { floating: boolean; isSmallScreen: boolean; position: Position | null },
  { width, fallback }: { width: string; fallback: string },
) {
  const className = isSmallScreen
    ? 'fixed inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl pb-[calc(1rem+env(safe-area-inset-bottom))]'
    : floating
      ? `fixed ${width} max-h-[calc(100vh-1rem)] rounded-md`
      : `${fallback} ${width} rounded-md`;
  const style = floating
    ? { left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? ('visible' as const) : ('hidden' as const) }
    : undefined;
  return { className, style };
}
