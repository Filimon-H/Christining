"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Path to the audio file, e.g. "/audio/blessing.m4a". */
  src: string;
  /** Rises to this level. Kept low — the invitation is the subject, not the sound. */
  volume?: number;
  /** Show the control. True whenever the invitation is on screen. */
  visible: boolean;
  /**
   * Begin playing without being asked. Only ever true for the tap that opened
   * the envelope — the one gesture a browser accepts as permission.
   */
  autoplay: boolean;
  /** Loop, for continuous music. Leave false for a one-off recording. */
  loop?: boolean;
};

/** Fade duration in ms — audio that starts abruptly feels like an error. */
const FADE_MS = 1400;
const FADE_STEP_MS = 40;

const STORAGE_KEY = "baptism-sound-muted";

/**
 * A quiet sound control.
 *
 * Playback only ever begins from the guest's own tap on the envelope: browsers
 * block un-gestured audio, and unexpected sound from a link someone opened in
 * a family group chat is intrusive regardless of what the browser permits.
 *
 * The choice is remembered, so a guest who mutes stays muted on return. Audio
 * also pauses when the tab goes to the background — nobody wants a page they
 * switched away from still playing.
 */
export default function SoundToggle({
  src,
  volume = 0.4,
  visible,
  autoplay,
  loop = false,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimer = useRef<number | null>(null);

  /** `null` until we've read storage, so the icon doesn't flip after mount. */
  const [muted, setMuted] = useState<boolean | null>(null);

  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* private browsing — default to unmuted */
    }
    setMuted(stored);
  }, []);

  const clearFade = useCallback(() => {
    if (fadeTimer.current !== null) {
      window.clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
  }, []);

  /** Ramp volume to a target, then optionally pause. */
  const fadeTo = useCallback(
    (target: number, thenPause = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      clearFade();
      const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS));
      const delta = (target - audio.volume) / steps;

      fadeTimer.current = window.setInterval(() => {
        const next = audio.volume + delta;
        const done =
          delta >= 0 ? next >= target - 0.01 : next <= target + 0.01;

        audio.volume = Math.min(1, Math.max(0, done ? target : next));

        if (done) {
          clearFade();
          if (thenPause) audio.pause();
        }
      }, FADE_STEP_MS);
    },
    [clearFade]
  );

  /* Start once the envelope has been opened, unless muted. */
  useEffect(() => {
    if (!autoplay || muted === null || muted) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0;
    // The play() promise rejects if the browser still considers this
    // un-gestured. That is a valid outcome, not an error worth surfacing.
    audio.play().then(
      () => fadeTo(volume),
      () => {
        /* blocked — the guest can start it with the button */
      }
    );
  }, [autoplay, muted, volume, fadeTo]);

  /* Pause in the background; resume only if the guest hadn't muted. */
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        clearFade();
        audio.pause();
      } else if (autoplay && muted === false) {
        audio.volume = 0;
        audio.play().then(() => fadeTo(volume), () => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [autoplay, muted, volume, fadeTo, clearFade]);

  useEffect(() => clearFade, [clearFade]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setMuted((wasMuted) => {
      const next = !wasMuted;

      try {
        sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* non-fatal */
      }

      if (next) {
        fadeTo(0, true);
      } else {
        audio.volume = 0;
        audio.play().then(() => fadeTo(volume), () => {});
      }

      return next;
    });
  }, [fadeTo, volume]);

  const isMuted = muted !== false;

  return (
    <>
      {/*
       * The audio element is always mounted, never gated on `visible`.
       *
       * Autoplay is requested the moment the envelope is tapped, but the
       * control only appears once the cover has lifted — roughly 2.5s later.
       * Mounting the element with the button meant the play() call had no
       * element to act on and the sound silently never started.
       */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- instrumental,
          no spoken content to caption. */}
      <audio ref={audioRef} src={src} loop={loop} preload="none" />

      {/*
       * Pinned bottom-left, clear of the gallery's controls, which occupy the
       * bottom centre and right.
       *
       * It needs its own surface: a bare icon disappears over a photograph, and
       * this control sits above full-bleed images for most of the page. A cream
       * pill with a hairline gold edge keeps it legible on both cream and photo
       * backgrounds without shouting.
       *
       * A pill with a word, not a bare icon disc: at 44px with a 17px glyph it
       * was easy to miss and easy to misread, so guests could not tell it
       * controlled sound and had no way to know they could silence it. The
       * label removes the guesswork and the larger target is easier to hit
       * one-handed.
       */}
      {visible && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={!isMuted}
          aria-label={isMuted ? "Play sacred music" : "Mute sacred music"}
          className="tap fixed bottom-0 left-0 z-controls gap-xs rounded-full border border-accent/50 bg-surface/90 pl-lg pr-xl text-accent-strong shadow-sm backdrop-blur-sm transition-colors duration-ui ease-gentle hover:border-accent hover:bg-surface"
          style={{
            marginBottom: "calc(var(--safe-bottom) + 1rem)",
            marginLeft: "calc(env(safe-area-inset-left, 0px) + 1rem)",
            minHeight: "3.25rem",
          }}
        >
          {isMuted ? (
            <VolumeX size={22} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <Volume2 size={22} strokeWidth={1.6} aria-hidden="true" />
          )}
          <span className="t-label text-accent-strong">
            {isMuted ? "Play" : "Mute"}
          </span>
        </button>
      )}
    </>
  );
}
