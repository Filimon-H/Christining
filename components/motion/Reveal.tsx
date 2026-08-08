"use client";

import { m } from "framer-motion";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export const EASE_GENTLE = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: ReactNode;
  /** Seconds to wait before starting. Use to stagger sibling lines. */
  delay?: number;
  /** Seconds. Section transitions ≈0.9s per the brief. */
  duration?: number;
  /** Upward travel distance in px. Kept within the 10–20px range. */
  y?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "p" | "span" | "li" | "h1" | "h2" | "figcaption";
  /** Animate once when scrolled into view (default) or immediately on mount. */
  trigger?: "inView" | "mount";
};

/**
 * The single reveal primitive used across the site: a soft opacity fade with
 * a small upward drift. Everything animated on this site is either this or a
 * crossfade — no springs, no bounce, no scale-in.
 *
 * Framer Motion respects prefers-reduced-motion for transform properties via
 * its own reducedMotion config (set in MotionProvider), so no branch here.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 0.9,
  y = 14,
  className = "",
  style,
  as = "div",
  trigger = "inView",
}: Props) {
  const Component = m[as];

  /*
   * Safety net. Text that starts at opacity 0 and waits on an observer is one
   * failed callback away from being invisible forever — unacceptable for an
   * invitation, where the words are the entire point.
   *
   * After a short grace period every reveal switches to an unconditional
   * `animate`, so content is guaranteed to appear whether or not the observer
   * ever fired. In normal use the guest is still reading scene 1 when this
   * elapses, and `once: true` means an already-played reveal simply stays put —
   * so this is invisible in practice and only rescues the failure case.
   */
  const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    if (trigger === "mount") return;
    const timer = window.setTimeout(() => setFailsafe(true), 2600);
    return () => window.clearTimeout(timer);
  }, [trigger]);

  const animation =
    trigger === "mount"
      ? { animate: { opacity: 1, y: 0 } }
      : {
          /*
           * Once the failsafe elapses, `animate` also drives opacity to 1.
           * Framer Motion applies both, and whichever resolves first wins —
           * so a working observer still produces the intended scroll reveal,
           * while a broken one no longer leaves the text invisible.
           */
          ...(failsafe ? { animate: { opacity: 1, y: 0 } } : {}),
          whileInView: { opacity: 1, y: 0 },
          /*
           * `once` keeps this a reveal rather than a repeating effect.
           *
           * `amount: "some"` — not a fraction. A fractional threshold (0.35)
           * silently fails for elements taller than that share of the
           * viewport: the observer never reports enough of them visible, and
           * the text stays at opacity 0 permanently. The large scripture
           * lines hit exactly that case. "some" fires on any intersection.
           *
           * `margin` starts the reveal slightly before the element's edge
           * reaches the viewport, so it is already settling as it arrives.
           */
          viewport: { once: true, amount: "some", margin: "0px 0px -10% 0px" } as const,
        };

  return (
    <Component
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      transition={{ duration, delay, ease: EASE_GENTLE }}
      {...animation}
    >
      {children}
    </Component>
  );
}
