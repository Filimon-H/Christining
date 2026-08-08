"use client";

import type { ReactNode } from "react";
import { invitation } from "@/data/invitation";
import OrthodoxCross from "./OrthodoxCross";
import Reveal from "./motion/Reveal";
import Countdown from "./Countdown";

const { event, church, reception, options } = invitation;

/** One detail block: gold label above a serif value. No cards, no boxes. */
function Detail({
  label,
  children,
  delay,
}: {
  label: string;
  children: ReactNode;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center gap-xs">
      <dt className="t-label">{label}</dt>
      <dd className="t-value">{children}</dd>
    </Reveal>
  );
}

/**
 * Scene 5 — the practical information, held in generous whitespace.
 *
 * A definition list, so each label/value pairing is real structure rather
 * than a visual coincidence.
 */
export default function EventDetails() {
  return (
    <section
      id="details"
      aria-labelledby="details-heading"
      className="scene bg-surface"
      style={{
        paddingTop: "calc(var(--safe-top) + 4.5rem)",
        paddingBottom: "calc(var(--safe-bottom) + 4.5rem)",
      }}
    >
      <div className="card-mount flex w-full max-w-invitation flex-col items-center px-lg py-2xl text-center">
        <span aria-hidden="true" className="corner-marks">
          <span />
          <span />
          <span />
          <span />
        </span>

        <Reveal y={0} duration={1.1}>
          <span className="cross-halo inline-block">
            <OrthodoxCross size={32} />
          </span>
        </Reveal>

        <Reveal delay={0.15} className="mt-xl">
          <h2 id="details-heading" className="t-eyebrow">
            The Holy Baptism
          </h2>
        </Reveal>

        <Reveal y={0} delay={0.25} className="mt-xl w-full max-w-rule-md">
          <div className="rule-ornate" />
        </Reveal>

        <dl className="mt-3xl flex flex-col items-center gap-4xl">
          <Detail label="Date" delay={0.35}>
            {event.dayOfWeek}
            <br />
            {event.dateLabel}
          </Detail>

          <Detail label="Time" delay={0.45}>
            {event.timeLabel}
          </Detail>

          <Detail label="Church" delay={0.55}>
            {church.name}
            {church.addressLines.map((line) => (
              <span key={line} className="t-value-sub mt-hair block">
                {line}
              </span>
            ))}
          </Detail>

          {reception && (
            <Detail label="Celebration" delay={0.65}>
              {reception.name}
              {reception.addressLines.map((line) => (
                <span key={line} className="t-value-sub mt-hair block">
                  {line}
                </span>
              ))}
              <span className="t-value-sub mt-xs block">
                {reception.timeLabel}
              </span>
            </Detail>
          )}
        </dl>

        {options.countdown && (
          <Reveal delay={0.8} className="mt-4xl">
            <Countdown isoDate={event.isoDate} />
          </Reveal>
        )}
      </div>
    </section>
  );
}
