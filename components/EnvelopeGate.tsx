"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { invitation } from "@/data/invitation";
import EnvelopePhoto from "./EnvelopePhoto";
import WaxSeal from "./WaxSeal";
import { EASE_GENTLE } from "./motion/Reveal";

/**
 * Rendered size of the seal, in px.
 *
 * The supplied artwork carries lettering around its rim, so it needs more room
 * than the drawn seal did — at 92px "INVITATION TO AMALDAN FILMON" was an
 * illegible smudge.
 */
const SEAL_SIZE = 150;

/**
 * The seal scales with the envelope rather than sitting at a fixed px size, so
 * it stays proportionate from a 320px phone up to a wide desktop.
 * 22% of the envelope width matches how a real seal sits on a card.
 */
const SEAL_WIDTH = "22%";

const STORAGE_KEY = "baptism-envelope-opened";

/** Flap swing, then the envelope lifts away. */
const FLAP_MS = 900;
const LIFT_DELAY_MS = 520;
const LIFT_MS = 1000;

/**
 * The photographic envelope runs a longer sequence than the drawn one — the
 * flap swings, then the card inside rises before anything lifts away — so the
 * cover has to stay on screen until that has played out. Cutting to the page
 * mid-swing is what makes an opening animation feel broken rather than quick.
 */
const PHOTO_LIFT_DELAY_MS = 1500;
const PHOTO_LIFT_MS = 1100;

/**
 * The photographic flap turns more slowly than the drawn one swings.
 *
 * A sheet of card this size takes closer to a second and a half to fall open;
 * at 900ms it reads as flicked rather than opened, which is the difference
 * between a paper animation and a UI panel.
 */
const PHOTO_FLAP_MS = 1400;

/**
 * Envelope proportions, in the SVG's own coordinate space.
 *
 * 4:3 rather than the usual 3:2 landscape — on a tall phone a wide, shallow
 * envelope leaves large empty bands above and below, whereas this fills the
 * screen the way a card held in both hands would.
 *
 * The flap descends to 56% of the height and the seal sits on that point; both
 * derive from these constants, so the geometry cannot drift out of alignment.
 */
const W = 300;
const H = 225;
const FLAP_Y = H * 0.56;

type Phase = "closed" | "opening" | "gone";

/**
 * The first thing a guest sees: a cream envelope closed with a gold wax seal.
 *
 * Tapping it swings the flap open and lifts the envelope away, revealing the
 * invitation beneath. Returning visitors in the same session skip it entirely.
 *
 * The invitation always renders underneath — this is a cover, not a loading
 * gate — so first paint and image preload are unaffected.
 *
 * The whole envelope is one SVG with a single viewBox rather than stacked
 * stretched layers, so every edge stays true at any width.
 */
export default function EnvelopeGate({
  enabled,
  onOpen,
}: {
  enabled: boolean;
  /** Fired on the opening tap — the gesture that lets audio start. */
  onOpen?: () => void;
}) {
  /**
   * `null` means "not yet decided": until storage is read we render nothing,
   * rather than flashing an envelope at a returning guest.
   */
  const [phase, setPhase] = useState<Phase | null>(null);
  const reduced = useReducedMotion();

  const photographic = invitation.options.envelopeImage;
  const aspect = invitation.options.envelopeAspect ?? 1.448;

  /* The photographic open takes longer to play; reduced motion skips the
     choreography entirely and just crossfades. */
  const liftDelayMs = reduced
    ? 0
    : photographic
      ? PHOTO_LIFT_DELAY_MS
      : LIFT_DELAY_MS;
  const liftMs = reduced ? 420 : photographic ? PHOTO_LIFT_MS : LIFT_MS;

  useEffect(() => {
    if (!enabled) {
      setPhase("gone");
      return;
    }

    // ?skipEnvelope bypasses the cover — used for screenshots, and for
    // linking someone straight to the invitation.
    if (new URLSearchParams(window.location.search).has("skipEnvelope")) {
      setPhase("gone");
      return;
    }

    let opened = false;
    try {
      opened = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Private browsing can throw on storage access — show the envelope.
    }

    setPhase(opened ? "gone" : "closed");
  }, [enabled]);

  /* Lock scrolling while the envelope covers the page. */
  useEffect(() => {
    if (phase !== "closed" && phase !== "opening") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  const open = useCallback(() => {
    setPhase((current) => {
      // Only signal on the real transition, not on a repeat tap mid-animation.
      if (current === "closed") {
        onOpen?.();
        return "opening";
      }
      return current;
    });

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* non-fatal */
    }

    window.setTimeout(() => setPhase("gone"), liftDelayMs + liftMs);
  }, [liftDelayMs, liftMs, onOpen]);

  const isOpening = phase === "opening";

  return (
    <AnimatePresence>
      {(phase === "closed" || phase === "opening") && (
        <m.div
          // Tighter gutter than the rest of the site: the envelope is meant to
          // reach close to the screen edges, like a card held in both hands.
          className="fixed inset-0 z-overlay flex flex-col items-center justify-center bg-surface px-md"
          initial={{ opacity: 1 }}
          animate={isOpening ? { opacity: 0, y: "-6%" } : { opacity: 1, y: 0 }}
          transition={{
            duration: liftMs / 1000,
            delay: isOpening ? liftDelayMs / 1000 : 0,
            ease: EASE_GENTLE,
          }}
          exit={{ opacity: 0 }}
        >
          {/* A button, so it is tappable, focusable and announced properly —
              not a div with an onClick. */}
          <m.button
            type="button"
            onClick={open}
            disabled={isOpening}
            aria-label="Open the invitation"
            className="relative block w-full max-w-envelope rounded-paper"
            whileTap={isOpening ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.2, ease: EASE_GENTLE }}
          >
            {photographic ? (
              <EnvelopePhoto
                src={photographic}
                aspect={aspect}
                opening={isOpening}
                flapMs={PHOTO_FLAP_MS}
                reduced={Boolean(reduced)}
              />
            ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              // Uniform scaling: the envelope keeps its 3:2 proportions
              // instead of stretching to the button box.
              preserveAspectRatio="xMidYMid meet"
              className="h-auto w-full overflow-visible"
              aria-hidden="true"
            >
              {/* Body */}
              <rect
                x="0.5"
                y="0.5"
                width={W - 1}
                height={H - 1}
                rx="2"
                fill="var(--surface-alt)"
                stroke="var(--line)"
                strokeWidth="1"
              />

              {/* Side panels, suggesting folded paper */}
              <path
                d={`M0 0 L0 ${H} L${W / 2} ${FLAP_Y} Z`}
                fill="var(--line-soft)"
                opacity="0.3"
              />
              <path
                d={`M${W} 0 L${W} ${H} L${W / 2} ${FLAP_Y} Z`}
                fill="var(--line-soft)"
                opacity="0.3"
              />

              {/* Bottom fold */}
              <path
                d={`M0 ${H} L${W / 2} ${FLAP_Y} L${W} ${H}`}
                fill="none"
                stroke="var(--line)"
                strokeWidth="0.8"
                opacity="0.75"
              />

              {/* Top flap. Rotates about the top edge to swing open.
                  Inside the SVG, so it scales with everything else. */}
              <m.path
                d={`M0 0 H${W} L${W / 2} ${FLAP_Y} Z`}
                fill="var(--surface)"
                stroke="var(--line)"
                strokeWidth="1"
                style={{ transformOrigin: "50% 0%", transformBox: "fill-box" }}
                animate={{ rotateX: isOpening ? -168 : 0 }}
                transition={{ duration: FLAP_MS / 1000, ease: EASE_GENTLE }}
              />
            </svg>
            )}

            {/* Wax seal, centred on the flap's point. Positioned in the same
                percentages the geometry uses, so it stays aligned at any size.
                Fades as the envelope opens, as though broken.

                Skipped for the photographic envelope, whose artwork is printed
                with its own seal already in place. */}
            {!photographic && (
            <m.span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${(FLAP_Y / H) * 100}%`, width: SEAL_WIDTH }}
              animate={{
                opacity: isOpening ? 0 : 1,
                scale: isOpening ? 0.86 : 1,
              }}
              transition={{ duration: 0.42, ease: EASE_GENTLE }}
            >
              {invitation.options.sealImage ? (
                <Image
                  src={invitation.options.sealImage}
                  alt=""
                  width={448}
                  height={442}
                  priority
                  // Decorative: the button's aria-label carries the meaning.
                  aria-hidden="true"
                  sizes="(max-width: 640px) 30vw, 150px"
                  className="h-auto w-full select-none"
                  // A whisper of shadow so the wax sits on the paper.
                  style={{
                    filter: "drop-shadow(0 3px 6px rgb(112 98 74 / 0.28))",
                  }}
                />
              ) : (
                <WaxSeal size={SEAL_SIZE} />
              )}
            </m.span>
            )}
          </m.button>

          {/* Prompt. Fades out once opening begins so it doesn't linger. */}
          <m.span
            className="t-whisper mt-2xl text-center"
            animate={{ opacity: isOpening ? 0 : 1 }}
            transition={{ duration: 0.3, ease: EASE_GENTLE }}
          >
            You&apos;re invited &mdash; tap to open
          </m.span>
        </m.div>
      )}
    </AnimatePresence>
  );
}
