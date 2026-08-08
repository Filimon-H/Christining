/**
 * Generates cream-toned placeholder images so the site can be reviewed before
 * the real photographs exist.
 *
 * Writes SVGs, then converts them to JPEG with macOS `sips`. Delete
 * public/photos/* and drop the real photos in with the same filenames when
 * they're ready — nothing else needs to change.
 *
 *   node scripts/make-placeholders.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "photos");
const TMP = join(process.cwd(), ".placeholder-tmp");

/** Warm neutrals in the site's palette, so placeholders don't jar. */
const TONES = [
  ["#EDE4D4", "#DFD2BC"],
  ["#E8DFCD", "#D6C7AE"],
  ["#F0E9DC", "#E0D5C0"],
  ["#E5DAC6", "#D2C2A8"],
  ["#EFE7D8", "#DCCEB6"],
];

const FILES = [
  { name: "hero", w: 1080, h: 1620, label: "Hero portrait" },
  { name: "01", w: 1080, h: 1620, label: "Photograph 01" },
  { name: "02", w: 1600, h: 1067, label: "Photograph 02" },
  { name: "03", w: 1080, h: 1620, label: "Photograph 03" },
  { name: "04", w: 1080, h: 1350, label: "Photograph 04" },
  { name: "05", w: 1600, h: 1067, label: "Photograph 05" },
  { name: "06", w: 1080, h: 1620, label: "Photograph 06" },
  { name: "07", w: 1080, h: 1350, label: "Photograph 07" },
  { name: "08", w: 1600, h: 1067, label: "Photograph 08" },
  { name: "closing", w: 1080, h: 1620, label: "Closing portrait" },
];

function svg({ w, h, label }, index) {
  const [from, to] = TONES[index % TONES.length];
  const cx = w / 2;
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy - h * 0.04}" r="${Math.min(w, h) * 0.11}" fill="none" stroke="#B59A5B" stroke-opacity="0.34" stroke-width="2"/>
  <text x="${cx}" y="${cy + h * 0.11}" font-family="Georgia,serif" font-size="${Math.round(Math.min(w, h) * 0.038)}" fill="#8A7A5E" fill-opacity="0.7" text-anchor="middle">${label}</text>
  <text x="${cx}" y="${cy + h * 0.155}" font-family="Helvetica,Arial,sans-serif" font-size="${Math.round(Math.min(w, h) * 0.022)}" letter-spacing="3" fill="#8A7A5E" fill-opacity="0.5" text-anchor="middle">${w} × ${h}</text>
</svg>`;
}

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

FILES.forEach((file, index) => {
  const svgPath = join(TMP, `${file.name}.svg`);
  writeFileSync(svgPath, svg(file, index));

  // sips reads SVG on modern macOS and writes a real JPEG.
  execFileSync("sips", [
    "-s", "format", "jpeg",
    "-s", "formatOptions", "78",
    svgPath,
    "--out", join(OUT, `${file.name}.jpg`),
  ], { stdio: "ignore" });

  console.log(`  ✓ photos/${file.name}.jpg  (${file.w}×${file.h})`);
});

/* Open Graph cover: 1200×630, typographic rather than photographic so the
   WhatsApp preview reads as an invitation even before photos exist. */
const ogPath = join(TMP, "og.svg");
writeFileSync(
  ogPath,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAF7F0"/>
  <g stroke="#B59A5B" stroke-width="2.2" fill="none" stroke-linecap="round">
    <path d="M600 210 V330"/><path d="M550 258 H650"/>
    <path d="M600 232 L618 258 L600 284 L582 258 Z"/>
    <path d="M578 222 H622"/><path d="M582 316 H618"/>
  </g>
  <text x="600" y="404" font-family="Helvetica,Arial,sans-serif" font-size="19" letter-spacing="8" fill="#AA8B4A" text-anchor="middle">WITH THANKFUL HEARTS</text>
  <text x="600" y="470" font-family="Georgia,serif" font-style="italic" font-size="52" fill="#27231F" text-anchor="middle">Holy Baptism</text>
  <path d="M500 505 H700" stroke="#D8CCB6" stroke-width="1.4"/>
  <text x="600" y="546" font-family="Georgia,serif" font-size="24" fill="#27231F" fill-opacity="0.72" text-anchor="middle">You are warmly invited</text>
</svg>`
);
execFileSync("sips", [
  "-s", "format", "jpeg",
  "-s", "formatOptions", "86",
  ogPath,
  "--out", join(process.cwd(), "public", "og-image.jpg"),
], { stdio: "ignore" });
console.log("  ✓ og-image.jpg  (1200×630)");

rmSync(TMP, { recursive: true, force: true });
console.log("\nPlaceholders written. Replace them with real photos using the same filenames.");
