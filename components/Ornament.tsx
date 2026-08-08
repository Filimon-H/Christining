import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
  /** 0.03–0.05 per the brief: visible only on close inspection. */
  opacity?: number;
};

/**
 * A faint ornamental band inspired by the interlace borders (harag) found in
 * Ethiopian Orthodox illuminated manuscripts. Tiling arcs with a diamond at
 * each junction, held at 4% so it reads as watermark rather than decoration.
 *
 * Purely decorative: hidden from assistive technology.
 */
export default function Ornament({
  className = "",
  style,
  opacity = 0.04,
}: Props) {
  return (
    <svg
      viewBox="0 0 240 24"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
      className={className}
      style={{ ...style, opacity }}
    >
      <defs>
        <pattern
          id="harag"
          x="0"
          y="0"
          width="40"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <g
            stroke="var(--ink)"
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
          >
            {/* Interlaced arcs, mirrored above and below the centreline */}
            <path d="M0 12 Q10 2 20 12 Q30 22 40 12" />
            <path d="M0 12 Q10 22 20 12 Q30 2 40 12" />
            {/* Diamond at the junction */}
            <path d="M20 8 L24 12 L20 16 L16 12 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="240" height="24" fill="url(#harag)" />
    </svg>
  );
}
