/**
 * Lifts the gold cross off the cream paper it was rendered on.
 *
 * The seal cutout keys on distance from a sampled backdrop colour, which works
 * when the subject and background are different hues. Here they are not: warm
 * gold on warm cream, and the render carries a soft golden glow that bleeds the
 * two together. Keying on colour distance either left a cream rectangle or ate
 * the pale highlights along the top of each strand.
 *
 * Saturation separates them cleanly instead. The paper is near-neutral (its
 * channels sit close together) while every part of the metal is chromatic, so
 * the test is "how far apart are max and min channel", feathered so edges stay
 * smooth. A luminance term rescues the darkest interlace shadows, which are low
 * saturation but clearly part of the object.
 *
 *   node scripts/cutout-cross.mjs <input.png> <output.png>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/cutout-cross.mjs <input.png> <output.png>");
  process.exit(1);
}

/* ── Decode ─────────────────────────────────────────────────────────── */

const file = readFileSync(inputPath);
if (file.readUInt32BE(0) !== 0x89504e47) {
  console.error("Not a PNG.");
  process.exit(1);
}

let offset = 8;
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;
const idat = [];

while (offset < file.length) {
  const length = file.readUInt32BE(offset);
  const type = file.toString("ascii", offset + 4, offset + 8);
  const data = file.subarray(offset + 8, offset + 8 + length);

  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
  } else if (type === "IDAT") {
    idat.push(data);
  } else if (type === "IEND") {
    break;
  }

  offset += 12 + length;
}

if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
  console.error(`Unsupported PNG: bitDepth=${bitDepth} colorType=${colorType}.`);
  process.exit(1);
}

const channels = colorType === 6 ? 4 : 3;
const raw = inflateSync(Buffer.concat(idat));
const stride = width * channels;
const pixels = Buffer.alloc(width * height * 4);

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

let previous = Buffer.alloc(stride);
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)];
  const line = Buffer.from(
    raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
  );

  for (let i = 0; i < stride; i++) {
    const left = i >= channels ? line[i - channels] : 0;
    const up = previous[i];
    const upLeft = i >= channels ? previous[i - channels] : 0;

    if (filter === 1) line[i] = (line[i] + left) & 0xff;
    else if (filter === 2) line[i] = (line[i] + up) & 0xff;
    else if (filter === 3) line[i] = (line[i] + ((left + up) >> 1)) & 0xff;
    else if (filter === 4) line[i] = (line[i] + paeth(left, up, upLeft)) & 0xff;
  }

  for (let x = 0; x < width; x++) {
    const from = x * channels;
    const to = (y * width + x) * 4;
    pixels[to] = line[from];
    pixels[to + 1] = line[from + 1];
    pixels[to + 2] = line[from + 2];
    pixels[to + 3] = channels === 4 ? line[from + 3] : 255;
  }

  previous = line;
}

/* ── Key on saturation ──────────────────────────────────────────────── */

/*
 * Thresholds measured from this render rather than guessed:
 *   paper  — chroma 12–29 (its warm flecks reach the high twenties)
 *   gold   — chroma 73–93
 *
 * So the boundary sits comfortably between them. An earlier pass used 22/46,
 * which caught the paper's flecks and kept 59% of the frame.
 */
const SAT_LOW = 34;
const SAT_HIGH = 58;

/*
 * Deep interlace shadows are desaturated but much darker than the paper, which
 * never drops below luma 230 here. 150 is safely between the two.
 */
const DARK_LUMA = 150;

let kept = 0;

/*
 * The render's golden glow pools unevenly around the object — brightest at the
 * lower left, where it pushed a patch of paper into gold's chroma range and
 * survived the key as a fully opaque corner. A radial falloff removes anything
 * beyond the artwork's reach regardless of colour: the cross fills the frame
 * centrally, so past ~0.52 of the half-diagonal there is only paper and glow.
 */
const centreX = width / 2;
const centreY = height / 2;
const reach = Math.min(width, height) * 0.52;

for (let i = 0; i < width * height; i++) {
  const p = i * 4;
  const px_ = i % width;
  const py_ = Math.floor(i / width);
  const r = pixels[p];
  const g = pixels[p + 1];
  const b = pixels[p + 2];

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;

  let alpha;
  if (chroma >= SAT_HIGH || luma < DARK_LUMA) {
    alpha = 255;
  } else if (chroma <= SAT_LOW) {
    alpha = 0;
  } else {
    alpha = Math.round(((chroma - SAT_LOW) / (SAT_HIGH - SAT_LOW)) * 255);
  }

  // Feather to nothing past the artwork's reach.
  const radius = Math.hypot(px_ - centreX, py_ - centreY);
  if (radius > reach) {
    const over = (radius - reach) / (reach * 0.22);
    alpha = Math.round(alpha * Math.max(0, 1 - over));
  }

  pixels[p + 3] = alpha;
  if (alpha > 8) kept++;
}

/* ── Trim to the artwork ────────────────────────────────────────────── */

let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (pixels[(y * width + x) * 4 + 3] > 24) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX < 0) {
  console.error("Everything was keyed out — thresholds are too aggressive.");
  process.exit(1);
}

const outWidth = maxX - minX + 1;
const outHeight = maxY - minY + 1;

/* ── Re-encode ──────────────────────────────────────────────────────── */

const outStride = outWidth * 4;
const outRaw = Buffer.alloc((outStride + 1) * outHeight);

for (let y = 0; y < outHeight; y++) {
  outRaw[y * (outStride + 1)] = 0;
  for (let x = 0; x < outWidth; x++) {
    const from = ((y + minY) * width + (x + minX)) * 4;
    const to = y * (outStride + 1) + 1 + x * 4;
    pixels.copy(outRaw, to, from, from + 4);
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(outWidth, 0);
ihdr.writeUInt32BE(outHeight, 4);
ihdr[8] = 8;
ihdr[9] = 6;

writeFileSync(
  outputPath,
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(outRaw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
);

console.log(
  `✓ ${outputPath}\n` +
    `  kept ${((kept / (width * height)) * 100).toFixed(1)}% of pixels\n` +
    `  ${width}×${height} → ${outWidth}×${outHeight} (trimmed)`
);
