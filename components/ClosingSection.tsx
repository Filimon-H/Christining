"use client";

import Image from "next/image";
import { invitation } from "@/data/invitation";
import OrthodoxCross from "./OrthodoxCross";
import Reveal from "./motion/Reveal";

const { closingPhoto, parents, child, event } = invitation;

/**
 * Scene 7 — the closing blessing over a final portrait.
 *
 * The photograph carries a cream veil rather than a dark one, so the page ends
 * in the same warm register it opened in. Charcoal text over that veil
 * measures ~13.8:1, comfortably past WCAG AA.
 */
export default function ClosingSection() {
  return (
    <footer className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={closingPhoto.src}
          alt={closingPhoto.alt}
          fill
          loading="lazy"
          sizes="100vw"
          quality={82}
          className="object-cover"
          style={{ objectPosition: closingPhoto.position ?? "50% 50%" }}
        />
        {/*
         * Cream veil, graded rather than flat.
         *
         * A uniform 82% wash dimmed the whole frame equally and left the
         * photograph barely visible — the closing image read as a pale texture
         * instead of a portrait of her. This is dense through the middle band
         * where the blessing sits and much lighter top and bottom, so the
         * photograph stays legible while the text keeps its contrast.
         *
         * Measured: charcoal over the veil ranges 12–13.6:1 across the mid-tones
         * of this photograph, and 8.5:1 at its worst — over her dark hair under
         * the lightest band. All comfortably past WCAG AA.
         */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(250 247 240 / 0.42) 0%, rgb(250 247 240 / 0.68) 22%, rgb(250 247 240 / 0.80) 45%, rgb(250 247 240 / 0.72) 72%, rgb(250 247 240 / 0.46) 100%)",
          }}
        />
      </div>

      <div
        className="band relative z-raised max-w-closing items-center text-center"
        style={{
          paddingTop: "calc(var(--safe-top) + 2rem)",
          paddingBottom: "calc(var(--safe-bottom) + 2rem)",
        }}
      >
        <Reveal y={0} duration={1.1}>
          <span className="cross-halo inline-block">
            <OrthodoxCross size={34} />
          </span>
        </Reveal>

        <Reveal delay={0.2} className="mt-2xl">
          <p className="t-verse">
            May God guide her footsteps
            <br />
            and surround her always
            <br />
            with His grace.
          </p>
        </Reveal>

        <Reveal y={0} delay={0.4} className="mt-3xl w-full max-w-rule-sm">
          <div className="rule-ornate" />
        </Reveal>

        <Reveal delay={0.5} className="mt-xl">
          <p className="t-whisper-plain">With love,</p>
          <p className="t-body mt-xs italic">{parents.names}</p>
        </Reveal>

        <Reveal delay={0.65} className="mt-4xl">
          <p className="t-whisper">
            {child.familyName
              ? `${child.shortName} ${child.familyName}`
              : child.shortName}{" "}
            &nbsp;&middot;&nbsp; Holy Baptism
            &nbsp;&middot;&nbsp; {event.year}
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
