"use client";

import { invitation } from "@/data/invitation";
import OrthodoxCross from "./OrthodoxCross";
import Ornament from "./Ornament";
import Reveal from "./motion/Reveal";

const { child, parents, event, geez } = invitation;

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
      className="scene scene-snug scene-peek"
    >
      {/* Faint manuscript band, sitting in the quiet margin below the scroll
          cue. Anywhere within the text block and it crosses a line. */}
      <Ornament
        className="pointer-events-none absolute inset-x-0 mx-auto w-[min(52%,18rem)]"
        style={{ bottom: "calc(var(--safe-bottom) + 0.5rem)" }}
      />

      {/*
       * The invitation sits on a barely-there mount — a hairline panel with a
       * lighter fill and gold corner marks. It gives the type an edge to sit
       * inside, which is what the printed reference has and a bare centred
       * column does not.
       */}
      {/*
       * Padding is fluid rather than a fixed step: on a 390px phone the card is
       * bounded by the viewport, so a fixed `px-lg` spends screen width the type
       * needs, while on desktop the same value looks mean against a 38rem card.
       */}
      <div
        className="card-mount flex w-full max-w-invitation flex-col items-center text-center"
        style={{
          paddingLeft: "clamp(1rem, 5vw, 2.5rem)",
          paddingRight: "clamp(1rem, 5vw, 2.5rem)",
          paddingTop: "clamp(2rem, 7vw, 3.5rem)",
          paddingBottom: "clamp(2rem, 7vw, 3.5rem)",
        }}
      >
        {/* Four gold corner brackets. Decorative. */}
        <span aria-hidden="true" className="corner-marks">
          <span />
          <span />
          <span />
          <span />
        </span>

        {/*
         * Large cross, centred behind the invitation text.
         *
         * A christening's central symbol should read as the thing the page is
         * about, not as a 40px ornament above a heading. At this scale the
         * Ethiopian interlace is actually legible — the openwork loops and
         * latticed centre only resolve above roughly 200px.
         *
         * Sits behind the type at low opacity, like a watermark pressed into
         * the paper, so it never competes with the child's name. Absolutely
         * positioned and pointer-inert so it takes no layout space and cannot
         * intercept a tap.
         */}
        {/*
         * Not a Reveal: that animates opacity to 1, which would blow out the
         * watermark, and sets its own transform, which fights the centring
         * translate. A plain element with a CSS fade keeps both under our
         * control.
         */}
        {/*
         * The gold interlaced cross supplied by the family, in place of the
         * drawn SVG. Plain <img>, not next/image: the file is already sized and
         * compressed for exactly this one use, so the optimiser has nothing to
         * add, and fill/sizes would only complicate the centring.
         */}
        <span aria-hidden="true" className="cross-watermark">
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          <img src="/cross.png" alt="" width={492} height={519} decoding="async" />
        </span>

        {/* Small cross at the head of the invitation, as a printed card has. */}
        <Reveal trigger="mount" duration={1.1} y={0}>
          <span className="cross-halo inline-block">
            <OrthodoxCross size={40} />
          </span>
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
          {/*
           * The father's name sits inside the same h1 so the full name is one
           * heading to a screen reader ("Amaldan Filimon"), while being set as
           * two lines visually, the way Ethiopian names are written. Both lines
           * share one size — see .t-name-family.
           *
           * The size step keys off the LONGER of the two names, not just the
           * given name: now that the second line is set at the same size, it is
           * the one that decides whether the block fits a 320px screen.
           */}
          <h1
            className={
              Math.max(
                child.name.length,
                child.familyName?.length ?? 0
              ) > 12
                ? "t-name-long"
                : "t-name"
            }
          >
            {child.name}
            {child.familyName && (
              <span className="t-name-family">{child.familyName}</span>
            )}
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
          <div className="rule-ornate" />
        </Reveal>

        {/*
         * Date only — no time, no venue.
         *
         * The full particulars belong to the details scene. Repeating them
         * here made the invitation read as a summary of a page the guest had
         * not reached yet, and put the venue on screen three separate times
         * across the site. The date is the one fact worth stating twice: it
         * is what a guest needs before deciding to read on.
         */}
        <Reveal trigger="mount" delay={1.0} className="mt-lg">
          <p className="t-value">
            {event.dayOfWeek}
            <br />
            {event.dateLabel}
          </p>
        </Reveal>

        {geez && (
          <Reveal trigger="mount" delay={1.1} className="mt-xl">
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

      </div>
    </section>
  );
}
