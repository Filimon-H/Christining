type Props = {
  /** Rendered size in px. Keep small — it should never dominate a scene. */
  size?: number;
  className?: string;
  /** Stroke colour. Defaults to the decorative gold token. */
  color?: string;
};

/**
 * An Ethiopian (Tewahedo) Orthodox cross, drawn in thin strokes.
 *
 * The form follows hand-cast Ethiopian neck and processional crosses: a
 * latticed square-armed cross with interlaced openwork, flared arm terminals
 * and a small central diamond. Line only, no fills, so it reads as delicate
 * engraving rather than a heavy glyph.
 *
 * Decorative, so it is hidden from assistive technology — the surrounding
 * text always carries the meaning.
 */
export default function OrthodoxCross({
  size = 34,
  className = "",
  color = "var(--accent)",
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
      className={className}
    >
      <g
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Shafts */}
        <path d="M50 11 V89" />
        <path d="M17 42 H83" />

        {/* Inner lattice square, rotated 45° — the woven centre */}
        <path d="M50 30 L66 46 L50 62 L34 46 Z" />

        {/* Central diamond, the visual anchor */}
        <path d="M50 40 L56 46 L50 52 L44 46 Z" />

        {/* Upper arm: flared crossbar and crest */}
        <path d="M38 20 H62" />
        <path d="M43 14 H57" />

        {/* Lower shaft: graduated bands, widest at the base */}
        <path d="M38 70 H62" />
        <path d="M42 80 H58" />

        {/* Left arm terminal */}
        <path d="M17 34 V50" />
        <path d="M24 37 V47" />

        {/* Right arm terminal */}
        <path d="M83 34 V50" />
        <path d="M76 37 V47" />

        {/* Openwork loops at the inner corners — the signature Ethiopian
            interlace, kept minimal so it stays legible at 30px */}
        <path d="M50 30 Q42 34 40 42" />
        <path d="M50 30 Q58 34 60 42" />
        <path d="M50 62 Q42 58 40 50" />
        <path d="M50 62 Q58 58 60 50" />
      </g>
    </svg>
  );
}
