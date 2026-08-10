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
      className="scene scene-snug bg-surface-alt"
    >
      {/*
       * The same mount and corner brackets as the invitation, so the two
       * typographic scenes read as facing pages of one card.
       *
       * `flex-1` with a min-height rather than fixed padding: the verse is only
       * four lines, so padding alone left the card at 411px inside an 844px
       * scene — 217px of bare cream above and below it, which read as the frame
       * having shrunk away from the page. Letting the card grow to fill the
       * scene matches how the invitation and details cards sit in theirs, and
       * the content stays optically centred because the figure centres it.
       */}
      <figure className="card-mount flex w-full max-w-prose flex-col items-center justify-center px-lg py-4xl text-center">
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
