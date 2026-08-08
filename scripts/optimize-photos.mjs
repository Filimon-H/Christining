/**
 * Prepares real photographs for the web.
 *
 * Phone originals are typically 4–8MB each; a gallery of them would take
 * minutes to load on mobile data. This resizes to 1600px on the long edge and
 * re-encodes at quality 82 — visually identical on a phone, usually 10–20×
 * smaller. next/image then derives AVIF and WebP at 480/768/1080/1600 from the
 * result, so this only needs to happen once.
 *
 * Uses macOS `sips`, so there is no dependency to install.
 *
 *   node scripts/optimize-photos.mjs <source-dir> [--dry]
 *
 * Files are matched to gallery slots by sorted filename order:
 *   1st → hero.jpg, then 01.jpg … 08.jpg, last → closing.jpg
 * Rename afterwards if you want a different order.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const MAX_EDGE = 1600;
const QUALITY = 82;
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".tiff", ".webp"];

const [, , sourceArg, ...flags] = process.argv;
const dryRun = flags.includes("--dry");

if (!sourceArg) {
  console.error(
    "Usage: node scripts/optimize-photos.mjs <source-dir> [--dry]\n\n" +
      "  <source-dir>  folder containing the original photographs\n" +
      "  --dry         list what would be written, without writing it"
  );
  process.exit(1);
}

const source = resolve(sourceArg);
if (!existsSync(source) || !statSync(source).isDirectory()) {
  console.error(`Not a directory: ${source}`);
  process.exit(1);
}

const destination = join(process.cwd(), "public", "photos");

const originals = readdirSync(source)
  .filter((name) => EXTENSIONS.includes(extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (originals.length === 0) {
  console.error(`No images found in ${source}`);
  process.exit(1);
}

/** Slot names, in the order the config expects them. */
function slotNames(count) {
  if (count === 1) return ["hero"];
  // First is the hero, last is the closing portrait, the rest are the gallery.
  const middle = count - 2;
  const gallery = Array.from({ length: Math.max(0, middle) }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  return ["hero", ...gallery, "closing"];
}

const names = slotNames(originals.length);

console.log(
  `\n${originals.length} image(s) → ${MAX_EDGE}px long edge, quality ${QUALITY}\n`
);

if (!dryRun) mkdirSync(destination, { recursive: true });

let totalBefore = 0;
let totalAfter = 0;

originals.forEach((original, index) => {
  const slot = names[index];
  const from = join(source, original);
  const to = join(destination, `${slot}.jpg`);
  const before = statSync(from).size;
  totalBefore += before;

  if (dryRun) {
    console.log(
      `  ${original}  →  photos/${slot}.jpg   (${(before / 1e6).toFixed(1)}MB)`
    );
    return;
  }

  execFileSync("sips", [
    "-Z", String(MAX_EDGE),            // fit within MAX_EDGE, preserving aspect
    "-s", "format", "jpeg",
    "-s", "formatOptions", String(QUALITY),
    from,
    "--out", to,
  ], { stdio: "ignore" });

  const after = statSync(to).size;
  totalAfter += after;

  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  console.log(
    `  ✓ ${original.padEnd(28)} → photos/${slot}.jpg   ` +
      `${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(2)}MB  (−${saved}%)`
  );
});

if (dryRun) {
  console.log("\nDry run — nothing written.");
} else {
  console.log(
    `\nTotal: ${(totalBefore / 1e6).toFixed(1)}MB → ${(totalAfter / 1e6).toFixed(1)}MB` +
      `  (−${Math.round((1 - totalAfter / totalBefore) * 100)}%)`
  );
  console.log(
    "\nNext: update alt text and `position` for each photo in data/invitation.ts.\n" +
      "Alt text is what a blind relative will hear — please write it properly.\n"
  );
}
