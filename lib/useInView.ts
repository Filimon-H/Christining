"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports when an element first comes near the viewport, then stops observing.
 *
 * Used to defer mounting the slideshow: Swiper measures its container on init,
 * and if it initialises while the section is still far off-screen it can latch
 * onto a fallback width (500px) that never corrects, overflowing the page.
 * Mounting only once the section is genuinely close guarantees a real
 * measurement — and it keeps the gallery's work off the critical path.
 *
 * `rootMargin` defaults to one viewport of lead time, so images have begun
 * loading by the time the guest arrives.
 */
export function useInView<T extends HTMLElement>(rootMargin = "100% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    // Without IntersectionObserver, show it immediately rather than never.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView } as const;
}
