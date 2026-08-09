"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { EASE_GENTLE } from "./motion/Reveal";

/**
 * Easing for the flap itself.
 *
 * A page does not turn on a symmetric curve. It resists briefly against the
 * fold, tips past its balance point, then falls the rest of the way under its
 * own weight — so the curve starts slow, accelerates hard through the middle,
 * and lands softly. A plain ease-in-out turns like a hinged panel; this turns
 * like paper.
 */
const EASE_PAPER = [0.32, 0, 0.16, 1] as const;

/**
 * The last few degrees settle separately, so the flap doesn't stop dead when
 * it reaches the back of the envelope.
 */
const EASE_SETTLE = [0.22, 1, 0.36, 1] as const;

/**
 * Flap geometry, as percentages of the artwork.
 *
 * The envelope is a photograph, so its flap cannot be moved as a layer. These
 * numbers were measured off the image by overlaying candidate triangles on the
 * gold fold line until one matched: the flap's upper corners sit inset from the
 * paper edge, and its point descends to just past the middle.
 *
 * Both halves below sample the *same* image and differ only in `clipPath`, so
 * the seam between them is invisible while closed — it falls exactly on the
 * printed fold.
 */
const INSET_X = 4.5;
const INSET_Y = 5.0;
const APEX_Y = 56.5;

/** Flap triangle: two top corners down to the point. */
const FLAP_CLIP =
  `polygon(${INSET_X}% ${INSET_Y}%, ${100 - INSET_X}% ${INSET_Y}%, 50% ${APEX_Y}%)`;

/**
 * Everything except the flap. Traced as the full rectangle with the flap
 * triangle cut out of its top edge, so the body keeps its border and corners.
 */
const BODY_CLIP =
  `polygon(0% 0%, ${INSET_X}% ${INSET_Y}%, 50% ${APEX_Y}%, ` +
  `${100 - INSET_X}% ${INSET_Y}%, 100% 0%, 100% 100%, 0% 100%)`;

type Props = {
  src: string;
  aspect: number;
  /** Drives the whole sequence. */
  opening: boolean;
  /** Set once the flap has swung clear, so the card can rise past it. */
  flapMs: number;
  reduced: boolean;
};

/**
 * The photographic envelope, sliced into a flap and a body so it can actually
 * open.
 *
 * Sequence: the seal's wax breaks and fades, the flap swings up and over on its
 * top hinge, and the card inside rises out. `perspective` on the wrapper is
 * what makes the flap's rotateX read as a fold in space rather than a squash.
 *
 * Under reduced motion the flap does not rotate at all — the envelope simply
 * fades, which conveys the same state change without any travel.
 */
export default function EnvelopePhoto({
  src,
  aspect,
  opening,
  flapMs,
  reduced,
}: Props) {
  const common = {
    src,
    alt: "",
    fill: true,
    priority: true,
    "aria-hidden": true as const,
    sizes: "(max-width: 640px) 92vw, 40rem",
    quality: 88,
    className: "select-none object-contain",
  };

  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: String(aspect),
        // Depth for the flap's fold. Roughly 1.6x the envelope width reads as
        // a card held at arm's length rather than a wide-angle exaggeration.
        perspective: "1600px",
        perspectiveOrigin: "50% 0%",
      }}
    >
      {/*
       * The card inside. Sits behind the body and rises as the flap clears,
       * so the envelope reads as being emptied rather than merely opened.
       */}
      <m.div
        aria-hidden="true"
        className="absolute rounded-paper bg-surface"
        style={{
          left: "7%",
          right: "7%",
          top: "10%",
          bottom: "8%",
          boxShadow: "0 6px 18px rgb(112 98 74 / 0.18)",
        }}
        initial={{ y: "4%", opacity: 0 }}
        animate={
          opening && !reduced
            ? { y: "-14%", opacity: 1 }
            : { y: "4%", opacity: 0 }
        }
        transition={{
          duration: 0.95,
          // Starts as the flap passes vertical, so the card appears to be
          // drawn out by the same gesture rather than as a separate event.
          delay: opening ? (flapMs / 1000) * 0.55 : 0,
          ease: EASE_GENTLE,
        }}
      />

      {/* Envelope body — the flap triangle is cut out of its top edge. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: BODY_CLIP, WebkitClipPath: BODY_CLIP }}
      >
        <Image {...common} />
      </div>

      {/*
       * Shadow cast by the raised flap onto the envelope below it.
       *
       * Deepens as the flap lifts and then clears as it travels past vertical,
       * which is what sells the flap as being *above* the paper rather than
       * drawn on it. Clipped to the body so it never spills outside the card.
       */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          clipPath: BODY_CLIP,
          WebkitClipPath: BODY_CLIP,
          background:
            "linear-gradient(to bottom, rgb(120 104 78 / 0.30) 0%, rgb(120 104 78 / 0.10) 34%, rgb(120 104 78 / 0) 58%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: opening && !reduced ? [0, 0.9, 0.5, 0] : 0 }}
        transition={{
          duration: flapMs / 1000,
          times: [0, 0.3, 0.62, 1],
          ease: "easeInOut",
        }}
      />

      {/*
       * The wax seal breaking.
       *
       * The seal is printed across the fold, so the flap tears it in two as it
       * lifts. The lower half stays with the body; this is the upper half,
       * clipped to the flap triangle and pulling away with it, fading as the
       * wax gives. It snaps early — a real seal breaks *before* the paper
       * moves, not while it swings.
       */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          clipPath: FLAP_CLIP,
          WebkitClipPath: FLAP_CLIP,
          transformOrigin: `50% ${INSET_Y}%`,
        }}
        animate={{ opacity: opening && !reduced ? 0 : 1 }}
        transition={{
          duration: (flapMs / 1000) * 0.28,
          ease: "easeOut",
        }}
      >
        <Image {...common} />
      </m.div>

      {/*
       * The flap. Hinged on its top edge, swinging back and over.
       *
       * -172° rather than a full 180° leaves the flap very slightly proud of
       * the envelope's back, so it stays readable as paper instead of
       * disappearing into an exactly edge-on plane.
       */}
      <m.div
        className="absolute inset-0"
        style={{
          clipPath: FLAP_CLIP,
          WebkitClipPath: FLAP_CLIP,
          transformOrigin: `50% ${INSET_Y}%`,
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: opening && !reduced ? [0, -32, -104, -158, -172] : 0,
        }}
        transition={{
          duration: flapMs / 1000,
          // Weighted so the flap lingers at the start, swings through the
          // middle, and eases into its final few degrees.
          times: [0, 0.22, 0.58, 0.85, 1],
          ease: [EASE_PAPER, EASE_PAPER, EASE_SETTLE, EASE_SETTLE],
        }}
      >
        {/*
         * Front — the printed face.
         *
         * `backface-visibility` cannot be relied on here: the rotation is
         * applied by Framer on this element's parent, so once past 90° the
         * browser keeps painting this face and the artwork appears mirrored.
         * Instead the front is explicitly hidden at the halfway point and the
         * back is revealed, which is deterministic in every engine.
         */}
        <m.div
          className="absolute inset-0"
          animate={{ opacity: opening && !reduced ? [1, 1, 0, 0] : 1 }}
          transition={{
            duration: flapMs / 1000,
            // Swaps within a few frames either side of vertical, where the
            // face is edge-on and the change cannot be seen.
            times: [0, 0.49, 0.53, 1],
            ease: "linear",
          }}
        >
          <Image {...common} />
        </m.div>

        {/*
         * Back — the inside of the flap, seen once it passes vertical.
         *
         * Real envelope paper is cream on both sides and a shade darker where
         * it sat folded, so this is a soft gradient rather than a mirrored
         * copy of the printed artwork.
         */}
        <m.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(236 228 214) 0%, rgb(245 240 230) 55%, rgb(250 247 240) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opening && !reduced ? [0, 0, 1, 1] : 0 }}
          transition={{
            duration: flapMs / 1000,
            times: [0, 0.49, 0.53, 1],
            ease: "linear",
          }}
        />
      </m.div>
    </div>
  );
}
