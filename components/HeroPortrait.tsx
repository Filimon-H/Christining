"use client";

import Image from "next/image";
import { invitation } from "@/data/invitation";
import Reveal from "./motion/Reveal";

const { heroPhoto } = invitation;

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
  return (
    <section
      aria-label="A portrait of our daughter"
      className="relative flex min-h-svh w-full items-end justify-center overflow-hidden bg-surface-alt"
    >
      <div className="absolute inset-0">
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
      </div>

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
