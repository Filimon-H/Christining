"use client";

import { useCallback, useRef } from "react";
import { Camera, Check, ImagePlus, AlertCircle } from "lucide-react";
import { uploadsEnabled } from "@/lib/cloudinary";
import { useGuestUploads } from "@/lib/useGuestUploads";
import OrthodoxCross from "./OrthodoxCross";
import Reveal from "./motion/Reveal";

/**
 * Scene 6 — the guests' own photographs.
 *
 * Every other scene is something the family gives the guest. This is the one
 * that runs the other way, so it is written as an invitation rather than a
 * form: no account, no app, no sign-in — two buttons and a thank-you.
 *
 * Uploads go straight from the guest's phone to Cloudinary, so there is no
 * server in the path and nothing that can be down on the day. See
 * lib/cloudinary.ts for why that is safe.
 */
export default function GuestPhotos() {
  const { items, succeeded, failed, busy, addFiles, accept } = useGuestUploads();

  /*
   * Two inputs, not one.
   *
   * `capture` on a file input is a one-way door: with it, iOS opens the camera
   * and offers no route to the camera roll, so a single input carrying it would
   * make the existing photographs — which is most of what guests will send —
   * unreachable. Two inputs let each button mean exactly one thing.
   */
  const libraryInput = useRef<HTMLInputElement | null>(null);
  const cameraInput = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      void addFiles(event.target.files);
      /*
       * Clearing the value matters: without it, choosing the same file twice in
       * a row fires no `change` event the second time — the browser sees an
       * unchanged value — and the guest concludes the button is broken.
       */
      event.target.value = "";
    },
    [addFiles]
  );

  /*
   * An unconfigured build renders nothing at all. A visible "share a photo"
   * section whose buttons fail on tap is worse than no section: the guest has
   * been asked for something and then let down, at an event where they cannot
   * ask anyone why.
   */
  if (!uploadsEnabled) return null;

  const total = items.length;
  const done = succeeded.length;

  return (
    <section
      id="photos"
      className="scene scene-snug w-full bg-surface-alt"
      aria-labelledby="photos-heading"
    >
      <div className="band max-w-prose items-center text-center">
        <Reveal y={0} duration={1.1}>
          <span className="cross-halo inline-block">
            <OrthodoxCross size={28} />
          </span>
        </Reveal>

        <Reveal delay={0.15} className="mt-xl">
          <h2 id="photos-heading" className="t-eyebrow">
            Share Your Photographs
          </h2>
        </Reveal>

        <Reveal y={0} delay={0.25} className="mt-lg w-full max-w-rule-sm">
          <div className="rule-ornate" />
        </Reveal>

        <Reveal delay={0.35} className="mt-lg">
          <p className="t-body">
            If you photograph anything on the day, we would love to have it.
            Send it here and it comes straight to us.
          </p>
          <p className="t-whisper-plain mt-sm">
            No account needed &nbsp;&middot;&nbsp; Photographs and video welcome
          </p>
        </Reveal>

        {/* The pair of pickers. Hidden inputs, styled buttons — a bare file
            input cannot be styled to sit alongside the rest of the page. */}
        <Reveal delay={0.45} className="mt-2xl w-full">
          <div className="flex flex-wrap items-center justify-center gap-sm">
            <button
              type="button"
              onClick={() => libraryInput.current?.click()}
              disabled={busy}
              className="btn-outline gap-xs disabled:opacity-55"
            >
              <ImagePlus size={17} strokeWidth={1.4} aria-hidden="true" />
              <span className="t-whisper-plain">
                {busy ? "Sending…" : "Choose photographs"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => cameraInput.current?.click()}
              disabled={busy}
              className="btn-outline gap-xs disabled:opacity-55"
            >
              <Camera size={17} strokeWidth={1.4} aria-hidden="true" />
              <span className="t-whisper-plain">Take a photograph</span>
            </button>
          </div>

          <input
            ref={libraryInput}
            type="file"
            accept={accept}
            multiple
            onChange={handleChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          {/* `capture="environment"` asks for the rear camera — the one
              pointed at the christening rather than at the guest. */}
          <input
            ref={cameraInput}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </Reveal>

        {/* Progress and receipts. Nothing renders until a guest has actually
            chosen something, so the resting state stays a clean invitation. */}
        {total > 0 && (
          <div className="mt-2xl w-full">
            <p className="t-whisper" aria-live="polite" aria-atomic="true">
              {busy
                ? `Sending ${done + 1} of ${total}`
                : done === total
                  ? done === 1
                    ? "One photograph received — thank you"
                    : `${done} photographs received — thank you`
                  : `${done} of ${total} sent`}
            </p>

            {/*
             * Flex-wrap with a fixed tile width, rather than a 4-column grid.
             *
             * A grid always fills its declared columns, so three photographs
             * left a dead fourth cell and the row hung to the left of the
             * centred text above it. Wrapping centres each row on its own
             * content, which is what makes a part-filled last row sit right.
             */}
            <ul className="mt-lg flex flex-wrap justify-center gap-xs">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="relative aspect-square w-tile shrink-0 overflow-hidden rounded-paper border border-line-soft bg-surface"
                >
                  {item.status === "done" && item.asset ? (
                    <>
                      {/*
                       * A plain <img>, not next/image. next/image optimises
                       * through the build server, and these URLs do not exist
                       * at build time — they are created by the guest, seconds
                       * ago. Cloudinary has already delivered a 200px square
                       * via its own CDN, so there is nothing left to optimise.
                       */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.asset.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                      {/*
                       * Fully opaque, not a 90% wash. Over a busy photograph —
                       * which most guest snapshots are — a translucent badge
                       * let the image through and the tick stopped reading as
                       * a tick. The ring separates it from whatever it lands on.
                       */}
                      <span
                        className="absolute bottom-hair right-hair flex size-badge items-center justify-center rounded-full bg-surface text-accent-strong ring-1 ring-line-soft"
                        aria-hidden="true"
                      >
                        <Check size={11} strokeWidth={2.5} />
                      </span>
                    </>
                  ) : item.status === "failed" ? (
                    <span
                      className="flex h-full w-full items-center justify-center text-ink-subtle"
                      title={item.error}
                    >
                      <AlertCircle size={16} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                  ) : (
                    /*
                     * In-flight tile: a gold bar filling left to right. The
                     * percentage is not printed — on a slow connection a number
                     * crawling from 4% to 6% reads as broken where a moving bar
                     * reads as working.
                     */
                    <span className="absolute inset-x-0 bottom-0 h-bar bg-line-soft">
                      <span
                        className="block h-full bg-accent transition-all duration-ui ease-gentle"
                        style={{ width: `${item.progress}%` }}
                      />
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Failures are named individually — "3 failed" leaves a guest with
                no idea which of their photographs to send again. */}
            {failed.length > 0 && (
              <ul className="mt-md space-y-hair text-left">
                {failed.map((item) => (
                  <li key={item.id} className="t-whisper-plain text-ink-muted">
                    {item.name} — {item.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
