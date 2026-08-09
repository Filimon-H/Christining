"use client";

import type { ReactNode } from "react";
import { appleMapsUrl, invitation } from "@/data/invitation";
import OrthodoxCross from "./OrthodoxCross";
import Reveal from "./motion/Reveal";
import Countdown from "./Countdown";

const { event, church, reception, options } = invitation;
const appleUrl = appleMapsUrl(invitation);

/**
 * One detail block: gold label above a serif value. No cards, no boxes.
 *
 * `am` renders beneath the English in Amharic. It is set one step quieter —
 * a translation is a second reading of the same fact, not a second fact, and
 * giving both equal weight makes the block read as twice as long.
 */
function Detail({
  label,
  children,
  am,
  delay,
}: {
  label: string;
  children: ReactNode;
  am?: ReactNode;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center gap-xs">
      <dt className="t-label">{label}</dt>
      <dd className="t-value">
        {children}
        {am && (
          <span
            lang="am"
            className="t-value-sub mt-xs block font-ethiopic normal-case tracking-normal"
          >
            {am}
          </span>
        )}
      </dd>
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
          {/*
           * "When" — one entry, not a Date block followed by a Time block.
           *
           * The invitation already announces the day and date, so repeating
           * them under their own heading here read as a summary of a page the
           * guest had just come from. Folding the time in gives this scene the
           * fact the invitation deliberately withholds, states the date once as
           * context rather than as news, and carries the Amharic date, which
           * appears nowhere else.
           */}
          <Detail
            label="When"
            delay={0.35}
            am={
              (event.dayOfWeekAm || event.timeLabelAm) && (
                <>
                  {event.dayOfWeekAm && (
                    <>
                      {event.dayOfWeekAm} · {event.dateLabelAm}
                    </>
                  )}
                  {event.timeLabelAm && (
                    <>
                      <br />
                      {event.timeLabelAm}
                    </>
                  )}
                </>
              )
            }
          >
            {event.dayOfWeek} &middot; {event.dateLabel}
            <br />
            <span className="text-accent-strong">{event.timeLabel}</span>
          </Detail>

          {/*
           * Venue, with the map links attached directly beneath the address
           * they refer to.
           *
           * These used to live in a separate location scene further down,
           * which meant the name and address were printed twice on the same
           * page. A guest reading an address wants the map link *there*, not
           * one scroll later.
           *
           * The label is "Where" rather than "Church": the gathering is at
           * the family home, so `church.name` reads "At Our Home".
           */}
          <Detail label="Where" delay={0.55}>
            {church.name}
            <address className="not-italic">
              {church.addressLines.map((line) => (
                <span key={line} className="t-value-sub mt-hair block">
                  {line}
                </span>
              ))}

              {/* Amharic directions. These are the family's own words rather
                  than a translation of the English — for guests navigating
                  locally, "ከ አፍሪካ ማደያ ገባ ብሎ" is the useful instruction. */}
              {church.nameAm && (
                <span
                  lang="am"
                  className="mt-lg block font-ethiopic normal-case tracking-normal"
                >
                  <span className="t-value-sub block">{church.nameAm}</span>
                  {church.addressLinesAm?.map((line) => (
                    <span key={line} className="t-value-sub mt-hair block">
                      {line}
                    </span>
                  ))}
                </span>
              )}
            </address>

            <span className="mt-xl flex flex-col items-center gap-sm">
              <a
                href={invitation.maps.google}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <span className="t-label text-ink">Open in Google Maps</span>
              </a>

              <a
                href={appleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet"
              >
                <span className="t-whisper">Open in Apple Maps</span>
              </a>
            </span>
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
