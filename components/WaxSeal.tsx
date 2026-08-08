type Props = {
  size?: number;
  className?: string;
};

/**
 * A wax seal bearing the Ethiopian Orthodox cross.
 *
 * The irregular outer edge is a hand-tuned path rather than a circle — real
 * wax spreads unevenly, and a perfect circle reads as a sticker. Depth comes
 * from a soft radial gradient plus a slightly inset darker ring, with no drop
 * shadow, so it stays consistent with the site's flat, printed feel.
 *
 * Decorative: hidden from assistive technology. The button that wraps it
 * carries the accessible label.
 */
export default function WaxSeal({ size = 108, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
      className={className}
    >
      <defs>
        {/* Warm gold wax, lit from the upper left. */}
        <radialGradient id="wax" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#CBAE6E" />
          <stop offset="52%" stopColor="#B0904D" />
          <stop offset="100%" stopColor="#8A6E36" />
        </radialGradient>
      </defs>

      {/*
       * Irregular wax blob. Real wax spreads unevenly, so the outline is not a
       * circle — but the mass is balanced around the 60,60 centre, otherwise
       * the seal reads as misaligned rather than hand-pressed.
       */}
      <path
        d="M60 8c12 0 20 4 28 9s16 10 19 20 0 19 0 27-2 18-8 24-16 8-25 11-15 4-24 2-17-8-24-14-12-13-13-22 0-19 3-28 9-17 18-22c8-4 14-7 26-7Z"
        fill="url(#wax)"
      />

      {/* Inner rim: the pressed edge where the stamp met the wax. */}
      <path
        d="M60 17c10 0 17 4 24 8s13 9 16 17 0 16 0 23-2 15-7 20-13 7-21 9-13 4-21 2-14-7-20-12-10-11-11-19 0-16 3-24 8-14 15-18c7-3 12-6 22-6Z"
        stroke="#7A5F2C"
        strokeOpacity="0.32"
        strokeWidth="1.1"
        fill="none"
      />

      {/* The cross, struck into the wax. Lighter strokes read as raised. */}
      <g
        stroke="#F3E6C6"
        strokeOpacity="0.88"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M60 30 V90" />
        <path d="M35 52 H85" />
        <path d="M60 44 L73 57 L60 70 L47 57 Z" />
        <path d="M60 51 L66 57 L60 63 L54 57 Z" />
        <path d="M50 37 H70" />
        <path d="M50 77 H70" />
        <path d="M35 45 V59" />
        <path d="M85 45 V59" />
      </g>
    </svg>
  );
}
