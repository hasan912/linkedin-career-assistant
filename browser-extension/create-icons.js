#!/usr/bin/env node
// Generates the extension icons (16, 48, 128 px) as valid PNG files using only
// Node.js built-in modules - no npm packages needed.
//
// Each icon: teal (#4E8C82) rounded square background with a white "C" centered
// (drawn as a ring with a right-side gap, so no fonts are required).
//
// Run:  node create-icons.js

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const TEAL = [0x4e, 0x8c, 0x82];
const WHITE = [0xff, 0xff, 0xff];

// ---------------------------------------------------------------- PNG encoding

// CRC-32 (per the PNG spec) for chunk checksums.
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

// pixels: flat RGB array, size*size*3 bytes.
function encodePng(size, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data: each scanline prefixed with filter byte 0 (None).
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3;
      const dst = rowStart + 1 + x * 3;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
    }
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------- drawing

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 3);

  const c = (size - 1) / 2; // center
  const outerR = size * 0.34; // "C" outer radius
  const innerR = size * 0.19; // "C" inner radius (ring thickness = outer - inner)
  // The "C" is a ring with a wedge removed on the right side (the opening).
  const gapHalfAngle = Math.PI / 4.5; // ~40 degrees each side of 0 (pointing right)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let color = TEAL;
      if (dist >= innerR && dist <= outerR) {
        // Angle 0 points right; the gap straddles it.
        const angle = Math.atan2(dy, dx);
        if (Math.abs(angle) > gapHalfAngle) color = WHITE;
      }

      const i = (y * size + x) * 3;
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
    }
  }
  return pixels;
}

// ---------------------------------------------------------------------- main

const outDir = path.join(__dirname, "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = encodePng(size, drawIcon(size));
  const file = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`Wrote ${file} (${png.length} bytes)`);
}
console.log("Done - icons generated.");
