import type { Config } from "tailwindcss";

/**
 * ─────────────────────────────────────────────────────────────
 *  DESIGN TOKENS
 * ─────────────────────────────────────────────────────────────
 *  Single source of truth for colour, spacing, type, motion and
 *  elevation. Components consume these names only — no arbitrary
 *  values, no !important overrides.
 *
 *  See DESIGN.md for the rationale behind each scale.
 * ─────────────────────────────────────────────────────────────
 */

/** Base-4 spacing scale. Named by role so intent survives refactors. */
const spacing = {
  0: "0px",
  px: "1px",
  /** 4px — hairline gaps, dot spacing */
  hair: "0.25rem",
  /** 8px — tight pairings (label above value) */
  xs: "0.5rem",
  /** 12px — related items within a group */
  sm: "0.75rem",
  /** 16px — default rhythm */
  md: "1rem",
  /** 24px — between distinct lines of an invitation block */
  lg: "1.5rem",
  /** 32px — between invitation blocks */
  xl: "2rem",
  /** 44px — minimum touch target (WCAG 2.5.8) */
  tap: "2.75rem",
  /** 48px — between major groups */
  "2xl": "3rem",
  /** 64px — around dividers and section headings */
  "3xl": "4rem",
  /** 88px — between detail groups in the details scene */
  "4xl": "5.5rem",
  /** 112px — scene-level breathing room */
  "5xl": "7rem",
} as const;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // Replace, not extend: an unconstrained palette is how systems drift.
    colors: {
      transparent: "transparent",
      current: "currentColor",

      /* ── Surfaces ─────────────────────────────── */
      /** Primary page background — warm ivory */
      surface: "#FAF7F0",
      /** Alternate scene background — soft cream */
      "surface-alt": "#F8F4EB",

      /* ── Content (on-surface) ─────────────────── */
      /** Primary text — warm charcoal. 12.6:1 on surface. */
      ink: "#27231F",
      /** Secondary text — 5.9:1 on surface, passes AA for body text. */
      "ink-muted": "#635B50",
      /** Tertiary / metadata — 4.6:1 on surface, AA for normal text. */
      "ink-subtle": "#776E61",

      /* ── Accent ───────────────────────────────── */
      /**
       * Decorative gold — rules, icons, ornament, borders.
       * 2.54:1 on surface: NEVER use for text of any size.
       */
      accent: "#B59A5B",
      /**
       * Text gold — the uppercase eyebrows and field labels.
       * Measured 4.90:1 on surface and 4.77:1 on surface-alt, so it clears
       * WCAG AA for normal-size text. The brief's #AA8B4A was only 4.1:1 and
       * failed at these small sizes; this is the nearest tone that passes
       * while still reading as antique gold.
       */
      "accent-strong": "#816937",
      /** Light gold — hairline borders only, never text. */
      "accent-soft": "#C1A663",

      /* ── Lines ────────────────────────────────── */
      /** Soft divider */
      line: "#D8CCB6",
      /** Faint divider */
      "line-soft": "#E7DECC",
    },

    spacing,

    extend: {
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        /*
         * Ethiopic (Ge'ez script) for the Amharic lines.
         *
         * System fonts only, deliberately. Fetching Noto Serif Ethiopic at
         * build time made the entire page fail whenever Google's font server
         * was slow — a hard third-party build dependency for a few lines of
         * text. Every platform an Ethiopian guest is likely to use already
         * ships a Ge'ez face, so the script renders correctly with no download:
         * Kefa on iOS and macOS, Nyala on Windows, Noto Serif/Sans Ethiopic on
         * Android and most Linux, Abyssinica SIL where it is installed.
         */
        ethiopic: [
          "Kefa",
          "Nyala",
          "Noto Serif Ethiopic",
          "Noto Sans Ethiopic",
          "Abyssinica SIL",
          "serif",
        ],
      },

      /**
       * Fluid type scale. Each step pairs a clamped size with its line-height
       * and tracking so callers never re-specify them.
       */
      fontSize: {
        /** Uppercase eyebrow / section label */
        eyebrow: [
          "clamp(0.6875rem, 3.2vw, 0.9375rem)",
          { lineHeight: "1.5", letterSpacing: "0.24em" },
        ],
        /** Small caps metadata, footer, scroll cue */
        whisper: [
          "clamp(0.6875rem, 2.9vw, 0.8125rem)",
          { lineHeight: "1.6", letterSpacing: "0.2em" },
        ],
        /** Field label above a value */
        label: [
          "clamp(0.6875rem, 2.9vw, 0.8125rem)",
          { lineHeight: "1.5", letterSpacing: "0.22em" },
        ],
        /** Invitation body copy */
        body: [
          "clamp(1.0625rem, 5vw, 1.5rem)",
          { lineHeight: "1.65", letterSpacing: "0" },
        ],
        /** Date, church, detail values */
        value: [
          "clamp(1.125rem, 5.2vw, 1.5rem)",
          { lineHeight: "1.5", letterSpacing: "0" },
        ],
        /** Countdown numerals */
        numeral: [
          "clamp(1.5rem, 6.4vw, 2rem)",
          { lineHeight: "1.2", letterSpacing: "0.02em" },
        ],
        /** Blessing / closing verse */
        verse: [
          "clamp(1.375rem, 5.8vw, 2rem)",
          { lineHeight: "1.45", letterSpacing: "0" },
        ],
        /** Scripture, the largest quoted text */
        scripture: [
          "clamp(1.5rem, 6.6vw, 2.5rem)",
          { lineHeight: "1.45", letterSpacing: "0" },
        ],
        /**
         * The child's name — the single display size.
         *
         * 9vw, not the brief's 13vw: at 13vw a long name overflowed a 390px
         * viewport. A real first name ("Mariamawit") is ~11 characters, which
         * this comfortably fits; `.t-name` additionally allows a hard break so
         * even an unusually long name wraps instead of bleeding off the edge.
         */
        name: [
          "clamp(2.5rem, 12vw, 5.5rem)",
          { lineHeight: "1.06", letterSpacing: "0.005em" },
        ],
        /** Step-down for names longer than ~12 characters. */
        "name-long": [
          "clamp(1.75rem, 7.5vw, 4rem)",
          { lineHeight: "1.12", letterSpacing: "0.01em" },
        ],
      },

      /** Content measures, so line length stays readable. */
      maxWidth: {
        invitation: "38rem",
        prose: "36rem",
        location: "30rem",
        closing: "32rem",
        /** The envelope cover — nearly full-bleed on a phone, generous on desktop */
        envelope: "46rem",
        /** Ge'ez directions — a measure so they wrap rather than run edge to edge */
        geez: "22ch",
        /** Divider widths */
        "rule-sm": "7rem",
        "rule-md": "9rem",
        "rule-lg": "16rem",
      },

      /** Paper-edge radius. Stationery is cut, not rounded. */
      borderRadius: {
        paper: "3px",
      },

      /** The shared fluid page gutter, as a spacing utility. */
      padding: {
        gutter: "var(--gutter)",
      },

      /* ── Motion tokens ─────────────────────────── */
      transitionTimingFunction: {
        gentle: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        /** UI response */
        ui: "200ms",
        /** Crossfades between captions */
        fade: "500ms",
        /** Section reveal */
        section: "900ms",
        /** Gallery slide */
        slide: "1000ms",
      },

      keyframes: {
        kenburns: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.012)" },
        },
      },
      animation: {
        kenburns: "kenburns 2500ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },

      /** Fixed sizes for small fixed-dimension UI. */
      size: {
        dot: "0.3125rem",
      },
      height: {
        dot: "0.3125rem",
      },
      width: {
        /** The active gallery dot, elongated */
        3: "0.875rem",
      },

      /**
       * minWidth/minHeight do not inherit from a *replaced* spacing scale, so
       * the touch-target token has to be declared on them explicitly.
       * Without this, `min-w-tap` silently emits nothing and every control
       * loses its 44px target.
       */
      minWidth: {
        tap: "2.75rem",
      },
      minHeight: {
        tap: "2.75rem",
        svh: "100svh",
      },

      /** z-index roles, so stacking is never guessed. */
      zIndex: {
        base: "0",
        raised: "10",
        controls: "20",
        indicator: "40",
        overlay: "50",
        grain: "60",
      },
    },
  },
  plugins: [],
} satisfies Config;
