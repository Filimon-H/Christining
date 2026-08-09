"use client";

import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { invitation } from "@/data/invitation";
import Reveal from "./motion/Reveal";

const { heroPhoto } = invitation;

/**
 * Parallax travel, as a percentage of the section's height.
 *
 * The image is over-scaled by the same proportion below so the drift can never
 * expose an edge. Kept small: this should register as depth, not as an effect.
 */
const DRIFT = 6;

/**
 * Scene 3 — the first photograph, revealed after the Scripture.
 *
 * The emotional hinge of the site: where the invitation becomes a photo album.
 * Full-bleed, with a slow Ken Burns drift and a cream scrim at the base so a
 * caption stays legible over a bright image.
 *
 * `priority` is set because this is the first photograph a guest reaches and
 * it should already be decoded by the time they scroll to it.
 */
export default function HeroPortrait() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  /*
   * The photograph drifts more slowly than the page, so the section feels like
   * a window onto her rather than a flat band of colour scrolling past.
   *
   * Tracked from the section entering the viewport to it leaving, so the
   * mapping is symmetric — the image sits at its true centre exactly when the
   * section does.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : [`-${DRIFT}%`, `${DRIFT}%`],
  );

  return (
    <section
      ref={sectionRef}
      aria-label="A portrait of our daughter"
      className="relative flex min-h-svh w-full items-end justify-center overflow-hidden bg-surface-alt"
    >
      {/*
       * Over-scaled by twice the drift so the travel stays inside the frame.
       * `willChange` keeps the drift on the compositor: without it, Safari
       * repaints the full-bleed image on every scroll tick.
       */}
      <m.div
        className="absolute inset-0"
        style={{
          y,
          height: `${100 + DRIFT * 2}%`,
          top: `-${DRIFT}%`,
          willChange: reduced ? undefined : "transform",
        }}
      >
        <Image
          src={heroPhoto.src}
          alt={heroPhoto.alt}
          fill
          priority
          sizes="100vw"
          quality={82}
          className="ken-burns object-cover"
          style={{ objectPosition: heroPhoto.position ?? "50% 50%" }}
        />
      </m.div>

      {heroPhoto.caption && (
        <>
          <div
            aria-hidden="true"
            className="scrim-bottom absolute inset-x-0 bottom-0 h-1/3"
          />
          <Reveal
            duration={1.1}
            className="relative z-raised text-center"
            style={{ paddingBottom: "calc(var(--safe-bottom) + 2.5rem)" }}
          >
            <p className="t-body italic">{heroPhoto.caption}</p>
          </Reveal>
        </>
      )}
    </section>
  );
}
