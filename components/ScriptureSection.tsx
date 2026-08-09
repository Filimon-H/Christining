"use client";

import { invitation } from "@/data/invitation";
import Reveal from "./motion/Reveal";

const { scripture } = invitation;

/** Seconds between line reveals — reads as one settling phrase, not a list. */
const LINE_STAGGER = 0.26;

/**
 * Scene 2 — one Scripture verse on cream, nothing else.
 *
 * Marked up as blockquote + cite so the attribution is programmatically
 * associated with the quotation rather than merely adjacent to it.
 */
export default function ScriptureSection() {
  const afterLines = scripture.lines.length * LINE_STAGGER;

  return (
    <section
      id="blessing"
      aria-label="A blessing"
      className="scene bg-surface-alt"
      style={{
        paddingTop: "calc(var(--safe-top) + 3rem)",
        paddingBottom: "calc(var(--safe-bottom) + 3rem)",
      }}
    >
      {/*
       * The same mount and corner brackets as the invitation, so the two
       * typographic scenes read as facing pages of one card. Generous vertical
       * padding: a short verse in a tight frame looks cramped, where the
       * invitation fills its own frame with copy.
       */}
      <figure className="card-mount flex w-full max-w-prose flex-col items-center px-lg py-4xl text-center">
        <span aria-hidden="true" className="corner-marks">
          <span />
          <span />
          <span />
          <span />
        </span>

        <blockquote className="flex flex-col items-center">
          {scripture.lines.map((line, index) => (
            <Reveal
              key={line}
              as="p"
              delay={index * LINE_STAGGER}
              duration={1.0}
              className="t-scripture"
            >
              {line}
            </Reveal>
          ))}
        </blockquote>

        <Reveal
          y={0}
          delay={afterLines + 0.2}
          className="mt-2xl w-full max-w-rule-sm"
        >
          <div className="rule-ornate" />
        </Reveal>

        <Reveal as="figcaption" delay={afterLines + 0.35} className="mt-lg">
          <cite className="t-eyebrow not-italic">{scripture.source}</cite>
        </Reveal>
      </figure>
    </section>
  );
}
