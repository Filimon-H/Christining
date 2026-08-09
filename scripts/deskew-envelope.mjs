/**
 * Deskew the generated envelope artwork into a true, straight rectangle.
 *
 * The supplied image is a render of an envelope lying at an angle on a white
 * background, with a drop shadow. The cover needs it square-on: a tilted
 * envelope inside an untilted browser viewport reads as a mistake rather than
 * as a photograph.
 *
 * This finds the envelope's four corners, applies the perspective transform
 * that maps them to a rectangle, warms the white surround to the site's cream
 * so no bright halo shows against the page, and writes an optimised JPEG.
 *
 *   node scripts/deskew-envelope.mjs <source.png>
 *
 * Requires sharp (already a dependency of the photo pipeline).
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = "public/photos/envelope.jpg";

/** Site surface colour. The artwork's white surround is blended toward this. */
const SURFACE = { r: 250, g: 247, b: 240 };

/**
 * Corners of the envelope in the supplied 2374x1792 artwork, found by masking
 * off the near-white background and taking the extreme points of the largest
 * connected region.
 *
 * Hard-coded because there is exactly one source image and re-deriving them on
 * every run would mean shipping a connected-components pass for no benefit. If
 * the artwork is ever regenerated these must be re-measured — the script
 * verifies the source dimensions below and refuses to run otherwise.
 */
const SOURCE_SIZE = { width: 2374, height: 1792 };
const CORNERS = {
  tl: [174, 377],
  tr: [1994, 183],
  br: [2267, 1424],
  bl: [344, 1701],
};

/** Grow the quad slightly about its centre to keep a hair of margin. */
const PAD = 1.012;

const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/**
 * Solve for the 8 perspective coefficients mapping destination -> source,
 * via Gaussian elimination on the 8x8 system. No matrix library needed.
 */
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let r = col + 1; r < n; r += 1) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];

    if (Math.abs(M[col][col]) < 1e-12) {
      throw new Error("Degenerate corner quad — cannot solve transform.");
    }

    for (let r = 0; r < n; r += 1) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let c = col; c <= n; c += 1) M[r][c] -= f * M[col][c];
    }
  }

  return M.map((row, i) => row[n] / row[i][i] ?? row[n] / M[i][i]);
}

const source = process.argv[2];
if (!source) {
  console.error("usage: node scripts/deskew-envelope.mjs <source.png>");
  process.exit(1);
}

const input = sharp(await readFile(source));
const meta = await input.metadata();

if (meta.width !== SOURCE_SIZE.width || meta.height !== SOURCE_SIZE.height) {
  console.error(
    `Source is ${meta.width}x${meta.height}, expected ${SOURCE_SIZE.width}x${SOURCE_SIZE.height}.\n` +
      "The hard-coded corner coordinates only apply to the original artwork; " +
      "re-measure them before running against a different image.",
  );
  process.exit(1);
}

const quad = [CORNERS.tl, CORNERS.tr, CORNERS.br, CORNERS.bl];
const cx = quad.reduce((s, p) => s + p[0], 0) / 4;
const cy = quad.reduce((s, p) => s + p[1], 0) / 4;
const grown = quad.map(([x, y]) => [
  cx + (x - cx) * PAD,
  cy + (y - cy) * PAD,
]);

const avgW = (dist(CORNERS.tl, CORNERS.tr) + dist(CORNERS.bl, CORNERS.br)) / 2;
const avgH = (dist(CORNERS.tl, CORNERS.bl) + dist(CORNERS.tr, CORNERS.br)) / 2;

const W = 1800;
const H = Math.round((W * avgH) / avgW);

const dst = [
  [0, 0],
  [W, 0],
  [W, H],
  [0, H],
];

const A = [];
const b = [];
dst.forEach(([x, y], i) => {
  const [u, v] = grown[i];
  A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
  b.push(u);
  A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
  b.push(v);
});
const [a0, a1, a2, a3, a4, a5, a6, a7] = solve(A, b);

const { data: src, info } = await input
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const channels = info.channels;
const out = Buffer.alloc(W * H * 3);

for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const denom = a6 * x + a7 * y + 1;
    const sx = (a0 * x + a1 * y + a2) / denom;
    const sy = (a3 * x + a4 * y + a5) / denom;

    // Bilinear sample.
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const fx = sx - x0;
    const fy = sy - y0;

    let r = 255;
    let g = 255;
    let bl = 255;

    if (x0 >= 0 && y0 >= 0 && x0 + 1 < info.width && y0 + 1 < info.height) {
      const at = (px, py) => (py * info.width + px) * channels;
      const p00 = at(x0, y0);
      const p10 = at(x0 + 1, y0);
      const p01 = at(x0, y0 + 1);
      const p11 = at(x0 + 1, y0 + 1);
      const mix = (o) =>
        src[p00 + o] * (1 - fx) * (1 - fy) +
        src[p10 + o] * fx * (1 - fy) +
        src[p01 + o] * (1 - fx) * fy +
        src[p11 + o] * fx * fy;
      r = mix(0);
      g = mix(1);
      bl = mix(2);
    }

    // Blend near-white toward the site's cream so the envelope sits on the
    // page without a bright fringe around its edge.
    const lum = (r + g + bl) / 3;
    const w = Math.min(1, Math.max(0, (lum - 246) / 9));
    const o = (y * W + x) * 3;
    out[o] = Math.round(r * (1 - w) + SURFACE.r * w);
    out[o + 1] = Math.round(g * (1 - w) + SURFACE.g * w);
    out[o + 2] = Math.round(bl * (1 - w) + SURFACE.b * w);
  }
}

await sharp(out, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 88, progressive: true, mozjpeg: true })
  .toFile(OUT);

console.log(`${path.basename(source)} -> ${OUT}  ${W}x${H} (aspect ${(W / H).toFixed(4)})`);
console.log("Set options.envelopeAspect in data/invitation.ts to this aspect.");
