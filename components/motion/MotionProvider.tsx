"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps the app in Framer Motion's lightweight feature set.
 *
 * `domAnimation` (~15kb) covers opacity/transform animations and gestures,
 * which is everything this site needs. It deliberately excludes layout
 * projection and the full `domMax` bundle.
 *
 * `reducedMotion="user"` makes every m.* component drop transform and layout
 * animations when the OS requests reduced motion, keeping opacity fades only.
 * That satisfies the brief globally rather than component by component.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
