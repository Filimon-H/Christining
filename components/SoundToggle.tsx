"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Path to the audio file, e.g. "/audio/blessing.m4a". */
  src: string;
  /** Rises to this level. Kept low — the invitation is the subject, not the sound. */
  volume?: number;
  /** Set true once the guest has opened the envelope, which is the gesture
   *  that permits playback. */
  armed: boolean;
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
  armed,
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
    if (!armed || muted === null || muted) return;

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
  }, [armed, muted, volume, fadeTo]);

  /* Pause in the background; resume only if the guest hadn't muted. */
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        clearFade();
        audio.pause();
      } else if (armed && muted === false) {
        audio.volume = 0;
        audio.play().then(() => fadeTo(volume), () => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [armed, muted, volume, fadeTo, clearFade]);

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

  // Nothing to control until the envelope is open.
  if (!armed) return null;

  const isMuted = muted !== false;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- instrumental,
          no spoken content to caption. */}
      <audio ref={audioRef} src={src} loop={loop} preload="none" />

      <button
        type="button"
        onClick={toggle}
        aria-pressed={!isMuted}
        aria-label={isMuted ? "Play sacred music" : "Mute sacred music"}
        className="btn-icon fixed bottom-0 right-0 z-controls m-md text-ink-subtle"
        style={{
          marginBottom: "calc(var(--safe-bottom) + 1rem)",
          marginRight: "calc(env(safe-area-inset-right, 0px) + 1rem)",
        }}
      >
        {isMuted ? (
          <VolumeX size={16} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Volume2 size={16} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
