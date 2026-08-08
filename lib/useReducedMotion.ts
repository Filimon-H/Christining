"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the OS reduced-motion preference.
 *
 * CSS handles the visual side of reduced motion, but autoplay is a JS
 * behaviour — it has to be switched off here. Starts as `false` so server and
 * first client render agree, then corrects in an effect (which runs before
 * paint for our purposes since autoplay only starts after mount).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
