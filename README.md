# Holy Baptism Invitation

A one-page digital invitation for an Ethiopian Orthodox christening. It opens as
a wax-sealed envelope, becomes a printed invitation, and unfolds into a
cinematic photo album.

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## What you need to change

**Everything personal lives in one file: [data/invitation.ts](data/invitation.ts).**
Nothing else needs editing. Every placeholder is wrapped in `[BRACKETS]` —
search for `[` to find them all.

```ts
child:    { name, baptismName?, shortName }
parents:  { names, signature }
event:    { isoDate, dayOfWeek, dateLabel, timeLabel, year }
church:   { name, addressLines[], locality }
reception?: { name, addressLines[], timeLabel }   // delete if not applicable
maps:     { google, apple? }
scripture:{ lines[], source }
geez:     string | null
gallery:  [{ src, alt, position?, caption? }]
options:  { envelope, countdown, music }
```

A few notes:

- **`isoDate`** must be a real ISO 8601 string with a timezone offset
  (`2026-09-12T10:00:00+03:00`). It drives the countdown.
- **`maps.google`** should be the exact Google Maps place URL for the church.
  Apple Maps is generated from the address if you leave `apple` undefined.
- **`geez` is `null` on purpose.** The Ge'ez blessing
  (`በአብ ወበወልድ ወበመንፈስ ቅዱስ`) is left disabled until the family or church confirms
  the exact wording — liturgical text should not be published on a guess. Set
  the string to enable it; the Ethiopic font loads only when it is non-null.
- **`options.countdown` is `false` by default.** A ticking timer pushes the tone
  toward "event website"; turn it on if you want it.
- **`alt` text is required on every photograph** and is currently descriptive
  placeholder text. Please rewrite it for the real images — it is what a blind
  relative will hear.

## Photographs

Drop your photos into `public/photos/` using the filenames already referenced in
the config (`hero.jpg`, `01.jpg` … `08.jpg`, `closing.jpg`), or change the
`src` values to match your own names.

**Do not ship originals straight from a phone.** A 12MP photo is 4–8MB, and
guests will open this on mobile data. Optimise first:

```bash
node scripts/optimize-photos.mjs ~/Desktop/baptism-photos
```

That resizes to 1600px on the long edge and re-encodes at quality 82, which is
indistinguishable on a phone and typically 10–20× smaller. `next/image` then
generates AVIF and WebP at 480/768/1080/1600 automatically.

Use `position` to keep her face visible when a photo is cropped to a tall phone
screen — it maps to CSS `object-position`:

```ts
{ src: "/photos/03.jpg", alt: "…", position: "50% 30%" }   // bias toward the top
```

Captions are optional and most photos should have none. Two or three across the
whole gallery is the right amount.

## The envelope

First-time visitors see a cream envelope with a gold wax seal and tap to open
it. The flap swings, the seal fades, and the envelope lifts away to reveal the
invitation.

It is remembered per session, so it does not reappear as someone scrolls back.
Append `?skipEnvelope` to any link to bypass it, or set
`options.envelope: false` to remove it entirely.

## Before you share the link

1. **Replace every `[PLACEHOLDER]`** in `data/invitation.ts`.
2. **Set the deployed URL** so link previews work. WhatsApp, Telegram and
   iMessage all require an absolute `og:image` URL:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```
   On Vercel this is inferred automatically; set it explicitly elsewhere.
3. **Replace `public/og-image.jpg`** (1200×630) with a real cover if you want a
   photograph in the preview. The current one is typographic.
4. **Check the maps links actually open the right place** on both a phone and a
   laptop.

## Privacy

This site contains photographs of a child, so it is built to stay unlisted:

- `noindex, nofollow, nocache` in the metadata
- No analytics, no trackers, no third-party scripts
- No embedded Google Map (an iframe would load Google's trackers) — the location
  section links out instead
- No comments, no likes, no social share buttons, no downloads

The URL is still public to anyone who has it. If you want a real barrier, add an
access code — but note that a shared code in a family WhatsApp group is
convenience, not security.

## Deploying

Static, no backend, no database.

```bash
npm run build
```

Push to GitHub and import the repository on Vercel; it needs no configuration.
Set `NEXT_PUBLIC_SITE_URL` in the project's environment variables.

## Checks

```bash
npm run typecheck                # types
node scripts/check-tokens.mjs    # design-token guard
npm run build                    # production build
./scripts/shots.sh               # screenshot every scene
```

See [DESIGN.md](DESIGN.md) for the design system — colour roles, spacing scale,
type scale, motion tokens, and the measured contrast ratios.

## Structure

```
app/
  layout.tsx          fonts, Open Graph metadata, noindex
  page.tsx            scene order
  globals.css         tokens + component classes
components/
  EnvelopeGate.tsx    wax-sealed cover
  WaxSeal.tsx         seal with the Orthodox cross
  InvitationHero.tsx  scene 1 — the invitation
  ScriptureSection.tsx scene 2 — one verse
  HeroPortrait.tsx    scene 3 — first photograph
  PhotoGallery.tsx    scene 4 — cinematic slideshow
  EventDetails.tsx    scene 5 — details + countdown
  LocationSection.tsx scene 6 — maps links
  ClosingSection.tsx  scene 7 — blessing
  SceneIndicator.tsx  01–04 position indicator
  OrthodoxCross.tsx   Tewahedo cross
  Ornament.tsx        faint manuscript band
  motion/             Reveal primitive, MotionProvider
data/invitation.ts    ← all your content
lib/                  reduced-motion + in-view hooks
scripts/              placeholders, photo optimisation, checks, screenshots
```
