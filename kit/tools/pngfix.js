// 把一张 8 位 RGBA 的 PNG 改写成 8 位 RGB（滤波 0、deflate 1 级）。只在少数帧上用：
// 无头 Chrome 的截图通常是 RGB（颜色类型 2），但个别帧里某个合成层的边缘会留下几个透明像素，这一帧就成了 RGBA（类型 6）。
// 图像流的像素格式中途一变，ffmpeg 会重建滤镜图——计数与历史清零，成片悄悄丢帧。所以送进管道之前把它改回 RGB。
// 透明像素用同一行左边的颜色补上（那是一条 1 像素宽的缝，补上后看不出来）。
const zlib = require('zlib');
const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length, 0); out.write(type, 4, 'latin1'); data.copy(out, 8); out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length); return out; };
// 读出头部：{ w, h, depth, colorType, interlace }
const head = (buf) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), depth: buf[24], colorType: buf[25], interlace: buf[28] });
function rgbaToRgb(buf) {
  const { w, h, depth, colorType, interlace } = head(buf);
  if (depth !== 8 || colorType !== 6 || interlace !== 0) throw new Error(`pngfix: unsupported PNG (depth=${depth} colorType=${colorType} interlace=${interlace})`);
  const idat = []; let p = 8;
  while (p + 12 <= buf.length) { const len = buf.readUInt32BE(p); if (buf.toString('latin1', p + 4, p + 8) === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len)); p += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * 4;
  if (raw.length !== h * (stride + 1)) throw new Error('pngfix: unexpected decoded size');
  const out = Buffer.alloc(h * (w * 3 + 1));
  let prev = new Uint8Array(stride), cur = new Uint8Array(stride), fixed = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    if (f === 0) cur.set(row);
    else if (f === 1) for (let i = 0; i < stride; i++) cur[i] = (row[i] + (i >= 4 ? cur[i - 4] : 0)) & 255;
    else if (f === 2) for (let i = 0; i < stride; i++) cur[i] = (row[i] + prev[i]) & 255;
    else if (f === 3) for (let i = 0; i < stride; i++) cur[i] = (row[i] + (((i >= 4 ? cur[i - 4] : 0) + prev[i]) >> 1)) & 255;
    else if (f === 4) for (let i = 0; i < stride; i++) { const a = i >= 4 ? cur[i - 4] : 0, b = prev[i], c = i >= 4 ? prev[i - 4] : 0, q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); cur[i] = (row[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
    else throw new Error('pngfix: bad filter type ' + f);
    const o = y * (w * 3 + 1); out[o] = 0;
    let lr = 0, lg = 0, lb = 0, have = false;
    for (let x = 0, i = 0, j = o + 1; x < w; x++, i += 4, j += 3) {
      const al = cur[i + 3]; let r = cur[i], g = cur[i + 1], b = cur[i + 2];
      if (al !== 255) {
        if (!have) { let k = i + 4; while (k < stride && cur[k + 3] !== 255) k += 4; if (k < stride) { lr = cur[k]; lg = cur[k + 1]; lb = cur[k + 2]; } have = true; }   // 行首就是透明：借右边第一个不透明的像素
        r = Math.round((r * al + lr * (255 - al)) / 255); g = Math.round((g * al + lg * (255 - al)) / 255); b = Math.round((b * al + lb * (255 - al)) / 255); fixed++;
      }
      out[j] = r; out[j + 1] = g; out[j + 2] = b; lr = r; lg = g; lb = b; have = true;
    }
    const t = prev; prev = cur; cur = t;
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return { png: Buffer.concat([buf.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(out, { level: 1 })), chunk('IEND', Buffer.alloc(0))]), fixed };
}
// 解码一张 8 位 RGB / RGBA、非隔行的 PNG，返回 { w, h, ch, px }（px 为逐像素的字节，每像素 ch 个）。inspect.js 用它从截图量实际对比度。
function decode(buf) {
  const { w, h, depth, colorType, interlace } = head(buf);
  if (depth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0) throw new Error(`pngfix: unsupported PNG (depth=${depth} colorType=${colorType} interlace=${interlace})`);
  const ch = colorType === 6 ? 4 : 3, stride = w * ch, idat = []; let p = 8;
  while (p + 12 <= buf.length) { const len = buf.readUInt32BE(p); if (buf.toString('latin1', p + 4, p + 8) === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len)); p += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat)), px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), o = y * stride, up = o - stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? px[o + i - ch] : 0, b = y ? px[up + i] : 0, c = (i >= ch && y) ? px[up + i - ch] : 0;
      let v = row[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      px[o + i] = v & 255;
    }
  }
  return { w, h, ch, px };
}
module.exports = { head, rgbaToRgb, decode };
if (require.main === module) {            // node kit/tools/pngfix.js in.png out.png
  const fs = require('fs'); const t0 = Date.now(); const r = rgbaToRgb(fs.readFileSync(process.argv[2])); fs.writeFileSync(process.argv[3], r.png);
  console.log(`fixed ${r.fixed} non-opaque pixels in ${Date.now() - t0} ms, ${r.png.length} bytes`);
}
