"use client";

import { invitation } from "@/data/invitation";
import OrthodoxCross from "./OrthodoxCross";
import Ornament from "./Ornament";
import Reveal from "./motion/Reveal";

const { child, parents, event, church, geez } = invitation;

/**
 * Scene 1 — the invitation itself.
 *
 * Entirely typographic by design. No photograph appears here: the first
 * portrait is held back until after the Scripture, which is what creates the
 * anticipation the brief asks for.
 *
 * Reveals trigger on mount and are staggered, so the invitation composes
 * itself once on load rather than waiting on a scroll.
 */
export default function InvitationHero() {
  return (
    <section
      id="invitation"
      aria-labelledby="invitation-heading"
      className="scene pb-3xl pt-2xl"
      style={{
        paddingTop: "calc(var(--safe-top) + 3rem)",
        paddingBottom: "calc(var(--safe-bottom) + 4rem)",
      }}
    >
      {/* Faint manuscript band, sitting in the quiet margin below the scroll
          cue. Anywhere within the text block and it crosses a line. */}
      <Ornament
        className="pointer-events-none absolute inset-x-0 mx-auto w-[min(52%,18rem)]"
        style={{ bottom: "calc(var(--safe-bottom) + 0.5rem)" }}
      />

      <div className="flex w-full max-w-invitation flex-col items-center text-center">
        <Reveal trigger="mount" duration={1.1} y={0}>
          <OrthodoxCross size={38} />
        </Reveal>

        <Reveal trigger="mount" delay={0.35} className="mt-xl">
          <p id="invitation-heading" className="t-eyebrow">
            With Thankful Hearts
          </p>
        </Reveal>

        <Reveal trigger="mount" delay={0.5} className="mt-lg">
          <p className="t-body">
            We joyfully invite you
            <br />
            to the Holy Baptism
            <br />
            of our beloved daughter
          </p>
        </Reveal>

        {/*
         * The visual centrepiece. A short name gets the full display size; a
         * long one steps down so it always fits the gutter on a 320px screen
         * rather than forcing every name to the smallest common size.
         */}
        <Reveal trigger="mount" delay={0.7} className="mt-lg">
          <h1 className={child.name.length > 12 ? "t-name-long" : "t-name"}>
            {child.name}
          </h1>
        </Reveal>

        {child.baptismName && (
          <Reveal trigger="mount" delay={0.8} className="mt-sm">
            <p className="t-whisper">{child.baptismName}</p>
          </Reveal>
        )}

        <Reveal
          trigger="mount"
          delay={0.9}
          y={0}
          className="mt-xl w-full max-w-rule-lg"
        >
          <div className="rule" />
        </Reveal>

        <Reveal trigger="mount" delay={1.0} className="mt-lg">
          <p className="t-value">
            {event.dayOfWeek}
            <br />
            {event.dateLabel}
            <br />
            {event.timeLabel}
          </p>
        </Reveal>

        <Reveal trigger="mount" delay={1.1} className="mt-lg">
          <p className="t-value">{church.name}</p>
          <p className="t-value-sub mt-hair">{church.locality}</p>
        </Reveal>

        {geez && (
          <Reveal trigger="mount" delay={1.2} className="mt-xl">
            <p lang="am" className="font-ethiopic text-label normal-case tracking-normal text-ink-muted">
              {geez}
            </p>
          </Reveal>
        )}

        {/* No hard break here: this sentence is long enough that a forced
            line overflows a 390px screen. `text-wrap: balance` on the
            element gives an even rag at any width. */}
        <Reveal trigger="mount" delay={1.25} className="mt-xl">
          <p className="t-body text-balance text-ink-muted">
            Please join us in prayer as she receives the Mystery of Holy
            Baptism.
          </p>
        </Reveal>

        <Reveal trigger="mount" delay={1.4} className="mt-xl">
          <p className="t-whisper-plain">With love,</p>
          <p className="t-body mt-xs italic">{parents.signature}</p>
        </Reveal>

        {/* Scroll cue — deliberately quiet. In the flow rather than absolutely
            positioned, so it can never sit on top of the signature when the
            invitation is taller than the viewport. */}
        <Reveal
          trigger="mount"
          delay={2.1}
          duration={1.2}
          className="mt-3xl flex flex-col items-center gap-xs"
        >
          <span aria-hidden="true" className="text-lg leading-none text-accent">
            &darr;
          </span>
          <span className="t-whisper">Scroll to continue</span>
        </Reveal>
      </div>
    </section>
  );
}
