"use client";

import { MapPin } from "lucide-react";
import { appleMapsUrl, invitation } from "@/data/invitation";
import Reveal from "./motion/Reveal";

const { church } = invitation;
const appleUrl = appleMapsUrl(invitation);

/**
 * Scene 6 — location.
 *
 * No embedded map: an iframe would cost hundreds of kilobytes and load
 * third-party trackers onto a page of a child's photographs. Two plain links
 * hand off to whichever maps app the guest already has.
 */
export default function LocationSection() {
  return (
    <section
      aria-labelledby="location-heading"
      className="band bg-surface-alt py-5xl"
    >
      <div className="flex w-full max-w-location flex-col items-center text-center">
        <Reveal y={0}>
          <MapPin
            size={19}
            strokeWidth={1.25}
            aria-hidden="true"
            className="text-accent"
          />
        </Reveal>

        <Reveal delay={0.12} className="mt-lg">
          <h2 id="location-heading" className="t-value">
            {church.name}
          </h2>
        </Reveal>

        <Reveal delay={0.22} className="mt-sm">
          <address className="not-italic">
            {church.addressLines.map((line) => (
              <span key={line} className="t-value-sub block">
                {line}
              </span>
            ))}
          </address>
        </Reveal>

        <Reveal delay={0.35} className="mt-2xl flex flex-col items-center gap-sm">
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
        </Reveal>
      </div>
    </section>
  );
}
