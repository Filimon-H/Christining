"use client";

import { useEffect, useState } from "react";

/**
 * A "there is more below" cue at the foot of the first screen.
 *
 * Guests were opening the link, reading the invitation, and stopping — never
 * learning there was a photo story and the venue beneath it. The scroll cue
 * that lived at the end of the invitation only appeared once you had already
 * scrolled past the fold to reach it, which is precisely too late.
 *
 * This is fixed to the viewport instead, so it is on screen the moment the page
 * opens whatever the content height, and it retires the first time the guest
 * scrolls. Pointer-inert, so it never intercepts a tap.
 */
export default function ScrollHint() {
  /*
   * `null` until the client decides, and nothing renders in that state.
   *
   * Rendering the element with a `data-hidden` that an effect then flips gave a
   * hydration mismatch: the server produced one attribute value and the client
   * another. Returning null on the server side of the first paint keeps the two
   * trees identical, and the cue appears a frame later — imperceptible, since it
   * fades in anyway.
   */
  const [hidden, setHidden] = useState<boolean | null>(null);

  useEffect(() => {
    // Only offer the cue when there is somewhere to scroll to.
    if (document.documentElement.scrollHeight <= window.innerHeight + 40) {
      setHidden(true);
      return;
    }

    setHidden(false);

    const onScroll = () => {
      if (window.scrollY > 24) {
        setHidden(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nothing on the server, and nothing until the client knows whether the page
  // actually scrolls.
  if (hidden === null) return null;

  return (
    <div
      className="scroll-hint"
      data-hidden={hidden}
      // Decorative: the page scrolls whether or not this is announced, and a
      // screen-reader user is already moving through the document linearly.
      aria-hidden="true"
    >
      <span className="t-whisper">Scroll</span>
      <span className="scroll-hint-arrow mt-xs text-lg leading-none text-accent">
        &darr;
      </span>
    </div>
  );
}
