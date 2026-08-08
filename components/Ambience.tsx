"use client";

/**
 * The ambient motion layer.
 *
 * Two very slow radial washes drifting in counter-motion behind all content,
 * plus a vignette that settles the edges of the page. Nothing here is meant to
 * be noticed directly — it exists so the cream background reads as lit paper
 * rather than a flat fill, which is the difference between "minimal" and
 * "plain".
 *
 * Amplitude is deliberately tiny (a few percent of translation, 0.04 opacity)
 * and the cycle is 22–28s, far slower than anything a guest would track. All
 * of it is pure CSS on composited properties, so it costs no main-thread work,
 * and it is switched off entirely under prefers-reduced-motion.
 */
export default function Ambience() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-base overflow-hidden"
    >
      {/* Warm gold wash, upper left. */}
      <div className="ambient-wash ambient-wash-a" />
      {/* Cooler cream wash, lower right, drifting the other way. */}
      <div className="ambient-wash ambient-wash-b" />
      {/* Edge vignette — keeps the corners from feeling empty. */}
      <div className="ambient-vignette" />
    </div>
  );
}
