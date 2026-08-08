/**
 * Cuts the flat backdrop out of the wax-seal artwork.
 *
 * The supplied render sits on an opaque grey field, which would show as a grey
 * rectangle on the cream envelope. This samples the corners to learn the
 * backdrop colour, then makes every pixel close to it transparent, feathering
 * the boundary so the seal's edge stays smooth rather than jagged.
 *
 * Also trims the transparent margin and drops a stray sparkle glyph in the
 * lower-right of the source.
 *
 * Pure Node — decodes and re-encodes PNG by hand, so there is no image
 * dependency to install.
 *
 *   node scripts/cutout-seal.mjs <input.png> <output.png>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/cutout-seal.mjs <input.png> <output.png>");
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
  console.error(
    `Unsupported PNG: bitDepth=${bitDepth} colorType=${colorType} (need 8-bit RGB or RGBA).`
  );
  process.exit(1);
}

const channels = colorType === 6 ? 4 : 3;
const raw = inflateSync(Buffer.concat(idat));
const stride = width * channels;

/* Undo the per-scanline filters to get flat pixel data. */
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
  const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));

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

/* ── Key out the backdrop ───────────────────────────────────────────── */

/** Average the four corners to learn the backdrop colour. */
const sampleCorners = () => {
  const spots = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of spots) {
    const i = (y * width + x) * 4;
    r += pixels[i];
    g += pixels[i + 1];
    b += pixels[i + 2];
  }
  return [r / spots.length, g / spots.length, b / spots.length];
};

const [bgR, bgG, bgB] = sampleCorners();

/*
 * Colour distance alone isn't enough: the render sits on a soft shadow that
 * shades the backdrop unevenly, so a single threshold either leaves grey in the
 * corners or eats into the wax.
 *
 * The seal is a disc near the centre, so combine two tests — colour proximity
 * to the backdrop, and radial distance from centre. Outside the seal's radius
 * everything goes; inside, only backdrop-coloured pixels do.
 */
const NEAR = 30;
const FAR = 72;

const centreX = width / 2;
const centreY = height / 2;
/* The wax fills most of the frame; past this fraction of the half-diagonal
   there is nothing but backdrop and shadow. */
const outerRadius = Math.min(width, height) * 0.5;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = (y * width + x) * 4;

    const distance = Math.hypot(
      pixels[p] - bgR,
      pixels[p + 1] - bgG,
      pixels[p + 2] - bgB
    );
    const radius = Math.hypot(x - centreX, y - centreY);

    // Well outside the disc: backdrop or its shadow, regardless of colour.
    if (radius > outerRadius * 1.02) {
      pixels[p + 3] = 0;
      continue;
    }

    if (distance <= NEAR) {
      pixels[p + 3] = 0;
    } else if (distance < FAR) {
      const t = (distance - NEAR) / (FAR - NEAR);
      pixels[p + 3] = Math.round(pixels[p + 3] * t);
    }
  }
}

/* ── Trim the transparent margin ────────────────────────────────────── */

let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (pixels[(y * width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX < 0) {
  console.error("Everything was keyed out — the backdrop sample is too broad.");
  process.exit(1);
}

/* A couple of pixels of breathing room, kept inside bounds. */
const pad = 2;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);

const outWidth = maxX - minX + 1;
const outHeight = maxY - minY + 1;

/* ── Re-encode ──────────────────────────────────────────────────────── */

const outStride = outWidth * 4;
const outRaw = Buffer.alloc((outStride + 1) * outHeight);

for (let y = 0; y < outHeight; y++) {
  outRaw[y * (outStride + 1)] = 0; // filter: none
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
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA

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
    `  backdrop rgb(${Math.round(bgR)}, ${Math.round(bgG)}, ${Math.round(bgB)}) keyed out\n` +
    `  ${width}×${height} → ${outWidth}×${outHeight} (trimmed)`
);
