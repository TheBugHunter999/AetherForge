/**
 * Generates static/glass/edge-displacement.png — rounded-rect edge lensing map
 * for SVG feDisplacementMap (R = X, G = Y, 128 = neutral).
 * Run: node scripts/generate-glass-displacement.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "static", "glass");
const outPath = path.join(outDir, "edge-displacement.png");

const SIZE = 512;
const CORNER = 0.22; // fraction of half-size for corner radius
const EDGE = 0.08; // edge band width (fraction of half-size)
const PEAK = 42; // max displacement from neutral 128

function roundedRectSDF(x, y, hw, hh, r) {
  const qx = Math.abs(x) - hw + r;
  const qy = Math.abs(y) - hh + r;
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outside = Math.hypot(ax, ay);
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const raw = Buffer.alloc((SIZE * SIZE * 4) + SIZE);
let offset = 0;
const hw = SIZE * 0.42;
const hh = SIZE * 0.42;
const radius = Math.min(hw, hh) * CORNER;

for (let y = 0; y < SIZE; y++) {
  raw[offset++] = 0; // filter byte per row
  for (let x = 0; x < SIZE; x++) {
    const px = x - SIZE / 2;
    const py = y - SIZE / 2;
    const sdf = roundedRectSDF(px, py, hw, hh, radius);
    const band = EDGE * Math.min(hw, hh);
    const edge = sdf < 0 ? 0 : Math.max(0, 1 - sdf / band);
    const edgeSmooth = edge * edge * (3 - 2 * edge);
    const len = Math.hypot(px, py) || 1;
    const nx = px / len;
    const ny = py / len;
    const disp = edgeSmooth * PEAK;
    const r = Math.round(128 + nx * disp);
    const g = Math.round(128 + ny * disp);
    raw[offset++] = r;
    raw[offset++] = g;
    raw[offset++] = 128;
    raw[offset++] = 255;
  }
}

const compressed = zlib.deflateSync(raw, { level: 9 });
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  signature,
  pngChunk("IHDR", ihdr),
  pngChunk("IDAT", compressed),
  pngChunk("IEND", Buffer.alloc(0)),
]);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${png.length} bytes)`);