import { useCallback, useState } from 'react';

// A value computed from an element's size, kept up to date while it resizes.
// It's a callback ref, so it follows the element when it is replaced (e.g. the first day of the
// grid after navigating to another month), and it ignores sizes of 0 (detached or hidden elements)
export function useMeasuredElement<T>(measure: (element: HTMLElement) => T, initial: T) {
  const [value, setValue] = useState(initial);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      const observer = new ResizeObserver(() => {
        if (!element.isConnected || element.clientWidth === 0 || element.clientHeight === 0) return;
        setValue(measure(element));
      });
      observer.observe(element);
      return () => observer.disconnect();
    },
    [measure],
  );

  return [ref, value] as const;
}
