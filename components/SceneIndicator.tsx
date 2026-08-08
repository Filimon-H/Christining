"use client";

import { useEffect, useState } from "react";
import { SCENES } from "@/data/invitation";

/**
 * A very quiet position indicator — 01 Invitation, 02 Blessing, and so on —
 * pinned to the right edge on wider screens.
 *
 * Not a navigation bar, but the entries are real anchors so keyboard and
 * screen-reader users can still move between scenes. Hidden below `sm`, where
 * there isn't room for it beside the invitation.
 */
export default function SceneIndicator() {
  const [active, setActive] = useState<string>(SCENES[0].id);

  useEffect(() => {
    const sections = SCENES.map((scene) =>
      document.getElementById(scene.id)
    ).filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible entry rather than the first intersecting one,
        // so a tall scene doesn't win simply by being tall.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) setActive(visible[0].target.id);
      },
      { threshold: [0.4, 0.6], rootMargin: "-20% 0px -20% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections of this invitation"
      className="fixed right-md top-1/2 z-indicator hidden -translate-y-1/2 sm:block"
    >
      <ol className="flex flex-col gap-md">
        {SCENES.map((scene, index) => {
          const isActive = active === scene.id;
          return (
            <li key={scene.id}>
              <a
                href={`#${scene.id}`}
                aria-current={isActive ? "true" : undefined}
                className={
                  isActive
                    ? "group flex items-center justify-end gap-xs opacity-100 transition-opacity duration-fade ease-gentle"
                    : "group flex items-center justify-end gap-xs opacity-40 transition-opacity duration-fade ease-gentle hover:opacity-70"
                }
              >
                {/* Label appears only on hover or keyboard focus. */}
                <span className="t-whisper opacity-0 transition-opacity duration-ui ease-gentle group-hover:opacity-100 group-focus-visible:opacity-100">
                  {scene.label}
                </span>
                <span className={isActive ? "t-whisper text-accent-strong" : "t-whisper"}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
