"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { invitation } from "@/data/invitation";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useInView } from "@/lib/useInView";

import "swiper/css";
import "swiper/css/effect-fade";

const { gallery } = invitation;

const AUTOPLAY_MS = 2000;
/*
 * The crossfade has to stay well under the dwell, or the gallery is mid-
 * transition for much of its life and never settles on an image. At a 2s dwell
 * 500ms keeps three-quarters of each turn as a still photograph, which is the
 * shortest fade that still reads as a dissolve rather than a cut.
 */
const FADE_MS = 500;
const FADE_MS_REDUCED = 300;
/**
 * How long to stay paused after interaction before drifting on again.
 *
 * 4s rather than 9s: the pause exists so a guest studying one photograph is not
 * interrupted, but at 9s the gallery felt broken rather than considerate — long
 * enough that most people concluded it did not advance on its own at all.
 */
const RESUME_AFTER_MS = 4000;

/**
 * Scene 4 — the cinematic slideshow.
 *
 * Crossfade only, 6s dwell, slow Ken Burns on the active slide. Autoplay
 * yields to the guest: any swipe, arrow key or button press pauses it, and it
 * resumes only after a stretch of inactivity.
 *
 * Autoplay is additionally suspended when the tab is hidden and when keyboard
 * focus enters the gallery, and never starts at all under reduced motion.
 */
export default function PhotoGallery() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const resumeTimer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  /* Hold Swiper's init until the section is near the viewport, so it measures
     a real width instead of falling back to 500px and overflowing the page. */
  const { ref: sectionRef, inView } = useInView<HTMLElement>();

  const [activeIndex, setActiveIndex] = useState(0);
  /** The guest's explicit choice via the pause/play control. */
  const [playing, setPlaying] = useState(true);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimer.current !== null) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  }, []);

  /*
   * The guest's play/pause choice, mirrored into a ref.
   *
   * The resume timer below fires seconds after it is scheduled and must read
   * the choice as it stands *then*. Reading the state variable would capture
   * its value at scheduling time, and because `pauseTemporarily` is rebuilt
   * whenever `playing` changes, an in-flight timer would keep a stale copy and
   * either resume a gallery the guest had paused or leave a playing one stopped.
   */
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  /** Pause now; drift back to autoplay once the guest goes quiet. */
  const pauseTemporarily = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay || reducedMotion) return;

    swiper.autoplay.stop();
    clearResumeTimer();

    resumeTimer.current = window.setTimeout(() => {
      // Respect an explicit pause, and never fight a motion preference.
      if (swiperRef.current?.autoplay && playingRef.current && !reducedMotion) {
        swiperRef.current.autoplay.start();
      }
    }, RESUME_AFTER_MS);
  }, [clearResumeTimer, reducedMotion]);

  const togglePlaying = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;

    setPlaying((wasPlaying) => {
      const next = !wasPlaying;
      clearResumeTimer();
      if (next) swiper.autoplay.start();
      else swiper.autoplay.stop();
      return next;
    });
  }, [clearResumeTimer]);

  /* Stop autoplay while the tab is in the background. */
  useEffect(() => {
    const onVisibilityChange = () => {
      const swiper = swiperRef.current;
      if (!swiper?.autoplay) return;

      if (document.hidden) swiper.autoplay.stop();
      else if (playing && !reducedMotion) swiper.autoplay.start();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [playing, reducedMotion]);

  /* Never leave a timer running after unmount. */
  useEffect(() => clearResumeTimer, [clearResumeTimer]);

  /* If the preference flips to reduced mid-session, stop immediately. */
  useEffect(() => {
    if (reducedMotion) {
      swiperRef.current?.autoplay?.stop();
      clearResumeTimer();
    }
  }, [reducedMotion, clearResumeTimer]);

  const goPrev = useCallback(() => {
    swiperRef.current?.slidePrev();
    pauseTemporarily();
  }, [pauseTemporarily]);

  const goNext = useCallback(() => {
    swiperRef.current?.slideNext();
    pauseTemporarily();
  }, [pauseTemporarily]);

  const current = gallery[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-roledescription="carousel"
      aria-label="A gallery of photographs of our daughter"
      className="relative h-svh w-full max-w-full overflow-hidden bg-surface-alt"
      // Focus entering the gallery pauses drift, so a guest reading with the
      // keyboard is never interrupted mid-photograph.
      //
      // Deliberately no `onPointerDown` here. It was pausing autoplay on *any*
      // touch inside the section — including the touch that scrolls the page
      // past it — so on a phone the gallery stopped the instant a finger landed
      // and, with a fresh touch resetting the timer each time, effectively never
      // advanced on its own. A real swipe is caught by Swiper's own
      // `onTouchEnd` below, which is the only pointer gesture that should pause.
      onFocus={pauseTemporarily}
    >
      {/* Before Swiper mounts, the first photograph stands in. Identical
          framing, so the handover causes no visible shift. */}
      {!inView && (
        <Image
          src={gallery[0].src}
          alt={gallery[0].alt}
          fill
          priority
          sizes="100vw"
          quality={82}
          className="object-cover"
          style={{ objectPosition: gallery[0].position ?? "50% 50%" }}
        />
      )}

      {inView && (
      <Swiper
        modules={[Autoplay, EffectFade, Keyboard, A11y]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={reducedMotion ? FADE_MS_REDUCED : FADE_MS}
        loop
        a11y={{
          enabled: true,
          prevSlideMessage: "Previous photograph",
          nextSlideMessage: "Next photograph",
          paginationBulletMessage: "Go to photograph {{index}}",
        }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        // Without these, Swiper measures once at init — before the lazy chunk's
        // layout has settled — and bakes a too-wide px width onto every slide.
        // That overflows the viewport and drags the whole page off-centre.
        observer
        observeParents
        resizeObserver
        watchOverflow
        autoplay={
          reducedMotion
            ? false
            : {
                delay: AUTOPLAY_MS,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }
        }
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          /*
           * Swiper mounts here only once the section nears the viewport, and
           * when it initialises while still off-screen its autoplay can settle
           * in a stopped state. Starting it explicitly on the next frame — once
           * the deck has measured — guarantees the gallery is already drifting
           * by the time the guest arrives at it.
           */
          if (!reducedMotion && playingRef.current) {
            requestAnimationFrame(() => swiper.autoplay?.start());
          }
        }}
        // Fires only when the guest actually dragged the deck, not when they
        // merely touched it in the course of scrolling the page.
        onTouchEnd={(swiper) => {
          if (swiper.touches.diff !== 0) pauseTemporarily();
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {gallery.map((photo, index) => (
          <SwiperSlide key={photo.src} className="relative h-full w-full">
            {({ isActive }) => (
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  // Only the first slide loads eagerly; the rest stream in.
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  sizes="100vw"
                  quality={82}
                  className={
                    isActive && !reducedMotion
                      ? "ken-burns object-cover"
                      : "object-cover"
                  }
                  style={{ objectPosition: photo.position ?? "50% 50%" }}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      )}

      {/* Caption for the active slide. Outside Swiper so loop-mode clones
          don't duplicate it. */}
      {current?.caption && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-raised flex justify-center"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 6rem)" }}
        >
          <div
            aria-hidden="true"
            className="scrim-bottom absolute inset-x-0 bottom-0 h-5xl"
          />
          {/* Keyed on src so it re-mounts per slide, giving each caption its
              own small rise as it arrives — secondary motion supporting the
              crossfade rather than competing with it. */}
          <p
            key={current.src}
            className="caption-rise allow-fade t-body relative italic"
          >
            {current.caption}
          </p>
        </div>
      )}

      {/* Controls — understated, but full-size touch targets. Rendered only
          once Swiper exists, so nothing is focusable before it can respond. */}
      {inView && (
      <div
        className="absolute inset-x-0 bottom-0 z-controls flex items-center justify-center gap-xs"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 1.25rem)" }}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous photograph"
          className="btn-icon"
        >
          <ChevronLeft size={20} strokeWidth={1.25} aria-hidden="true" />
        </button>

        {/* Progress dots. The buttons carry the interaction, so these are
            decorative and hidden from assistive tech. */}
        <ul aria-hidden="true" className="flex items-center gap-hair px-hair">
          {gallery.map((photo, index) => (
            <li
              key={photo.src}
              // The active dot elongates into a small bar as well as changing
              // colour, so position is legible at a glance.
              className={
                index === activeIndex
                  ? "h-dot w-3 rounded-full bg-accent transition-all duration-fade ease-gentle"
                  : "size-dot rounded-full bg-line transition-all duration-fade ease-gentle"
              }
            />
          ))}
        </ul>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next photograph"
          className="btn-icon"
        >
          <ChevronRight size={20} strokeWidth={1.25} aria-hidden="true" />
        </button>

        {/* Only meaningful when autoplay could actually run. */}
        {!reducedMotion && (
          <button
            type="button"
            onClick={togglePlaying}
            aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
            className="btn-icon"
          >
            {playing ? (
              <Pause size={14} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Play size={14} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      )}

      {/* Announce slide changes without moving focus. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Photograph ${activeIndex + 1} of ${gallery.length}`}
      </p>
    </section>
  );
}
