# Design system

Every value the interface uses is a named token in [tailwind.config.ts](tailwind.config.ts),
mirrored as CSS custom properties in [app/globals.css](app/globals.css) for the
few places CSS needs them directly (SVG strokes, gradients, keyframes). The
Tailwind config is the source of truth.

No component contains a hex colour, a pixel spacing value, or an arbitrary
Tailwind value. `node scripts/check-tokens.mjs` enforces this and fails on any
violation — it is worth running before every commit.

---

## Colour

Roles, not names. `bg-ivory` says what a colour *is*; `bg-surface` says what it
is *for*, which is what survives a redesign.

| Token | Value | Role | Contrast on `surface` |
|---|---|---|---|
| `surface` | `#FAF7F0` | Page background (warm ivory) | — |
| `surface-alt` | `#F8F4EB` | Alternate scene background (soft cream) | — |
| `ink` | `#27231F` | Primary text | **14.58:1** ✅ AAA |
| `ink-muted` | `#635B50` | Secondary text | **6.25:1** ✅ AA |
| `ink-subtle` | `#776E61` | Metadata, captions | **4.69:1** ✅ AA |
| `accent` | `#B59A5B` | Rules, icons, ornament, borders | 2.54:1 ⛔ **never text** |
| `accent-strong` | `#816937` | Eyebrows, field labels, links | **4.90:1** ✅ AA |
| `accent-soft` | `#C1A663` | Hairline borders only | — ⛔ never text |
| `line` | `#D8CCB6` | Dividers | — |
| `line-soft` | `#E7DECC` | Faint fills | — |

Ratios are measured, not estimated. Two notes on how they shaped the palette:

- **`accent-strong` is not the brief's `#AA8B4A`.** That tone measures 4.11:1,
  which fails WCAG AA for normal-size text — and every place gold is used for
  text here (`t-eyebrow`, `t-label`) is small. `#816937` is the lightest gold
  that clears 4.5:1 on both backgrounds while still reading as antique gold.
- **`accent` must never carry text.** At 2.54:1 it is decorative only. It is
  correct for the cross, the hairline rules and the ornament, and wrong for
  anything a guest has to read.

There is no dark mode. The design is a printed cream invitation; inverting it
would defeat the concept.

## Spacing

Base-4, named by role so intent survives refactoring.

| Token | Value | Used for |
|---|---|---|
| `hair` | 4px | Dot gaps, tight label/value pairs |
| `xs` | 8px | Label above its value |
| `sm` | 12px | Related items in a group |
| `md` | 16px | Default rhythm |
| `lg` | 24px | Between lines of an invitation block |
| `xl` | 32px | Between invitation blocks |
| `tap` | 44px | Minimum touch target (WCAG 2.5.8) |
| `2xl` | 48px | Between major groups |
| `3xl` | 64px | Around dividers and headings |
| `4xl` | 88px | Between detail groups |
| `5xl` | 112px | Scene-level breathing room |

`--gutter` (`clamp(1.375rem, 7vw, 4rem)`) is the shared page inset, applied by
`.scene`, `.band` and `px-gutter`. It is fluid rather than tokenised because it
scales with the viewport rather than stepping.

## Typography

Two families: **Cormorant Garamond** for anything editorial, **Inter** for
uppercase labels and metadata. **Noto Serif Ethiopic** loads only if the Ge'ez
line is enabled.

Each type token carries its own size, leading and tracking, so a caller never
re-declares them. Sizes are fluid via `clamp()`.

| Class | Token | Size range | Role |
|---|---|---|---|
| `t-eyebrow` | `eyebrow` | 11 → 14px | Uppercase section opener |
| `t-whisper` | `whisper` | 10 → 11px | Footer, scroll cue, metadata |
| `t-whisper-plain` | `whisper` | 10 → 11px | Sentence-case variant ("With love,") |
| `t-label` | `label` | 10 → 11px | Field label above a value |
| `t-body` | `body` | 17 → 23px | Invitation body copy |
| `t-value` | `value` | 18 → 22px | Date, church, detail values |
| `t-value-sub` | — | 0.86em | Address lines, subordinate detail |
| `t-numeral` | `numeral` | 22 → 30px | Countdown figures |
| `t-verse` | `verse` | 20 → 30px | Closing blessing |
| `t-scripture` | `scripture` | 22 → 38px | The Scripture verse |
| `t-name` | `name` | 38 → 88px | The child's name |
| `t-name-long` | `name-long` | 28 → 64px | Names over 12 characters |

Two decisions worth keeping:

- **The name has two sizes.** The brief asked for `clamp(46px, 8vw, 100px)`; at
  that scale a long name overflowed a 390px screen. Rather than shrinking every
  name to fit the worst case, `InvitationHero` picks `t-name-long` past 12
  characters, so a short name still gets the full display treatment.
- **Both name variants set `text-wrap: balance` and `overflow-wrap: break-word`.**
  The name is the one string whose length isn't ours to control.

## Motion

One easing curve, `cubic-bezier(0.22, 1, 0.36, 1)`, exposed as `ease-gentle`.
Nothing bounces, springs, or rotates in 3D except the envelope flap.

| Token | Duration | Used for |
|---|---|---|
| `duration-ui` | 200ms | Hover and focus response |
| `duration-fade` | 500ms | Caption crossfade, indicator |
| `duration-section` | 900ms | Section reveal |
| `duration-slide` | 1000ms | Gallery crossfade |
| — | 6000ms | Ken Burns drift (`animate-kenburns`) |

Reveals are all one primitive, [`Reveal`](components/motion/Reveal.tsx): opacity
plus 10–20px of upward travel. Two subtleties in it:

- `viewport.amount` is `"some"`, not a fraction. A fractional threshold
  silently fails for elements taller than that share of the viewport — the
  observer never reports enough of them visible and the text stays invisible.
  The large Scripture lines hit exactly that case.
- After 2.6s a failsafe drives every pending reveal to visible regardless of
  the observer. Text that starts at `opacity: 0` and waits on a callback is one
  missed callback away from never appearing, which is unacceptable when the
  words are the whole point.

`MotionConfig reducedMotion="user"` makes Framer Motion drop transforms
globally when the OS asks. CSS handles the rest, and autoplay is disabled in JS
because a media query cannot stop a timer.

## Components

Variants are consistent: `btn` is the base, and `-outline` / `-quiet` / `-icon`
are the variants. All three inherit the 44px minimum target from `.tap`.

| Class | Role |
|---|---|
| `.scene` | Full-height section, `min-h-svh` + gutter |
| `.band` | Content-height section + gutter |
| `.rule` | Hairline gold divider, fading at both ends |
| `.tap` | 44×44 minimum target |
| `.btn-outline` | Primary action ("Open in Google Maps") |
| `.btn-quiet` | Secondary action ("Open in Apple Maps") |
| `.btn-icon` | Icon-only control (gallery prev/next/pause) |
| `.scrim-bottom` | Cream gradient behind captions over photos |
| `.ken-burns` | 6s scale drift, disabled under reduced motion |
| `.allow-fade` | Opacity transition that survives reduced motion |
| `.paper-grain` | ~2% inline SVG noise, fixed overlay |

`minWidth` and `minHeight` declare `tap` explicitly. Tailwind's min-* scales do
**not** inherit from a *replaced* `spacing` scale, so `min-w-tap` silently
emitted nothing and every button lost its touch target until this was caught.

## Z-index

Named roles, so stacking is never guessed: `base` 0, `raised` 10,
`controls` 20, `indicator` 40, `overlay` 50, `grain` 60.

---

## Verifying

```bash
node scripts/check-tokens.mjs   # stale/arbitrary token guard
npx tsc --noEmit                # types
npm run build                   # production build
./scripts/shots.sh              # screenshot each scene
```

For scroll-dependent behaviour, `--screenshot` is not enough — it captures
before hydration and cannot scroll. Use the CDP driver:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --hide-scrollbars --remote-debugging-port=9222 \
  --window-size=440,900 about:blank &
node --experimental-websocket scripts/cdp.mjs http://localhost:3000/?skipEnvelope ./shots
```

It loads, scrolls to each scene, reports the computed opacity of every text
element, and screenshots as it goes — which is how the reveal bug above was
found and confirmed fixed.
