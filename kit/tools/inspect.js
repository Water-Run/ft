// 「用文字看画面」的公共部分：在页面里收集某一时刻真正可见的元素，并在 Node 侧做版面判断。
// look.js（看几帧）、scan.js（扫全片）、check.js（总闸门）都用它。
//
// 收集规则（在浏览器里执行）：
//   文字项 text  ：自己带文字的元素；或「子元素全是行内元素」的一行（整行算一项，不拆成一个个 span）
//   色块项 block ：有不透明背景色、面积够大的元素（终端、纸、色块、线）
//   具名项 named ：带 data-name 属性的元素（SVG 图形、没有背景的容器等），用它给图形起名字
//   绘图项 gfx   ：<svg> 与 <canvas>。它们里面画了什么，文字规则看不见；这里只记一个内容指纹，用来判断画面有没有变
//   不可见的不收：display:none、visibility:hidden、累计不透明度 < 0.03、完全在画外或被裁掉
// 元素上的可选标记：
//   data-name="软盘"      给这个元素起名，报告里用这个名字
//   data-bleed            故意出血到画外的大字/大图形，不报「被画面边缘切掉」
//   data-overlap-ok       故意压在别的文字上的元素，不报「文字重叠」
// 对比度：先按 DOM 推断文字压在哪个底色上；推断出不合格时再截下那一小块、按实际像素量一遍（refine），
//         所以压在 SVG 图形、canvas、被 clip-path 裁开的图层上的文字不会误报。
const W = 1920, H = 1080, CAP_TOP = 968;      // 字幕条占 968–1080
// 可在 project.json 的 check 段调整：min_font（画面内最小字号，px，按变换后的实际大小算）、margin（文字离画面左右边缘的最小距离，0 = 不查）
const CFG = { min_font: 22, margin: 0 };
const configure = (c = {}) => { for (const k of Object.keys(CFG)) if (c[k] != null) CFG[k] = c[k]; };

function COLLECT() {
  const stage = document.getElementById('stage');
  const hex = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return c; const p = m[1].split(',').map((x) => parseFloat(x)); if (p.length > 3 && p[3] === 0) return null; return '#' + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase() + (p.length > 3 && p[3] < 1 ? '@' + p[3].toFixed(2) : ''); };
  const inline = (el) => { const d = getComputedStyle(el).display; return d.startsWith('inline') || d === 'contents'; };
  const ownText = (el) => { let s = ''; for (const n of el.childNodes) if (n.nodeType === 3) s += n.nodeValue; return s.replace(/\s+/g, ' ').trim(); };
  const nameOf = (el) => el.getAttribute('data-name') || (el.id ? '#' + el.id : '') || (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase());
  const isect = (a, b) => { const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y), r = Math.min(a.x + a.w, b.x + b.w), bt = Math.min(a.y + a.h, b.y + b.h); return r > x && bt > y ? { x, y, w: r - x, h: bt - y } : null; };
  const STAGE = { x: 0, y: 0, w: 1920, h: 1080 };
  const out = []; let seq = 0;
  const walk = (el, op, clip, bgStack) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const o = op * parseFloat(cs.opacity || '1');
    if (o < 0.03) return;
    const svgEl = el instanceof SVGElement;
    const kids = [...el.children];
    const txt = svgEl ? '' : ownText(el);
    const lineLike = !svgEl && !txt && kids.length > 0 && kids.every(inline) && el.textContent.trim() !== '';
    let b = el.getBoundingClientRect();
    const boxH = b.height;
    if (txt || lineLike) {                       // 文字项量的是「字本身」占的范围，不是整个块（一行代码的块可能比字宽得多）
      const rg = document.createRange(); rg.selectNodeContents(el); const rb = rg.getBoundingClientRect();
      if (rb.width > 0 && rb.height > 0) b = rb;
    }
    const full = { x: b.left, y: b.top, w: b.width, h: b.height };
    // clip-path（擦除、光圈式的揭示与转场）：把它折算成矩形并入裁剪范围；被完全裁掉的元素连同子树都不算可见
    if (!svgEl && cs.clipPath && cs.clipPath !== 'none') {
      const eb = el.getBoundingClientRect(), sx = el.offsetWidth ? eb.width / el.offsetWidth : 1, sy = el.offsetHeight ? eb.height / el.offsetHeight : 1;
      const len = (v, ref, k) => (v.endsWith('%') ? parseFloat(v) / 100 * ref : parseFloat(v) * k);
      let cp = null, m;
      if ((m = cs.clipPath.match(/^inset\(([^)]+)\)/))) { const p = m[1].split(/\s+round\s+/)[0].trim().split(/\s+/); const t = p[0], r = p[1] || t, bt = p[2] || t, l = p[3] || r; const T = len(t, eb.height, sy), R = len(r, eb.width, sx), B = len(bt, eb.height, sy), L = len(l, eb.width, sx); cp = { x: eb.left + L, y: eb.top + T, w: eb.width - L - R, h: eb.height - T - B }; }
      else if ((m = cs.clipPath.match(/^circle\(([\d.]+)(px|%)? at ([\d.-]+)(px|%) ([\d.-]+)(px|%)\)/))) { const R = m[2] === '%' ? parseFloat(m[1]) / 100 * Math.hypot(eb.width, eb.height) / Math.SQRT2 : parseFloat(m[1]) * sx, X = len(m[3] + m[4], eb.width, sx), Y = len(m[5] + m[6], eb.height, sy); cp = { x: eb.left + X - R, y: eb.top + Y - R, w: 2 * R, h: 2 * R }; }
      if (cp) { clip = cp.w > 0.5 && cp.h > 0.5 ? isect(clip, cp) : null; if (!clip) return; }
    }
    const vis = isect(full, clip);
    const bg = svgEl ? null : hex(cs.backgroundColor);
    const structural = el === stage || ['bg', 'scenes', 'hud', 'caption'].includes(el.id) || (typeof el.className === 'string' && /(^| )scene( |$)/.test(el.className));
    const base = () => ({ i: seq++, name: nameOf(el), x: Math.round(full.x), y: Math.round(full.y), w: Math.round(full.w), h: Math.round(full.h), op: +o.toFixed(2),
      scene: (el.closest('.scene') || {}).id || (el.closest('#hud') ? 'hud' : el.closest('#caption') ? 'caption' : ''), bleed: !!el.closest('[data-bleed]'), ovok: !!el.closest('[data-overlap-ok]'),
      cut: vis && (vis.w < full.w - 1.5 || vis.h < full.h - 1.5) ? [full.x < clip.x - 1 ? 'L' : '', full.y < clip.y - 1 ? 'T' : '', full.x + full.w > clip.x + clip.w + 1 ? 'R' : '', full.y + full.h > clip.y + clip.h + 1 ? 'B' : ''].join('') : '',
      cutByStage: !!vis && (full.x < -1 || full.y < -1 || full.x + full.w > 1921 || full.y + full.h > 1081) });
    if (txt || lineLike) {
      if (vis && full.w > 0) {
        const scale = el.offsetHeight ? boxH / el.offsetHeight : 1;
        // 字号与字色：自己带字就取自己的；整行由若干 span 拼成时，取字最多的那个 span 的
        let st = cs;
        if (!txt && lineLike) { const k = kids.slice().sort((p, q) => q.textContent.trim().length - p.textContent.trim().length)[0]; if (k) st = getComputedStyle(k); }
        // 底色：元素（或那个 span）自己带不透明底色时就是它；否则取祖先链上最近的底色
        const own = [hex(st.backgroundColor), bg].find((c) => c && !c.includes('@')) || null;
        const under = own || (bgStack.length ? bgStack[bgStack.length - 1] : null);
        out.push({ k: el.closest('#caption') ? 'cap' : 'text', ...base(), text: el.textContent.replace(/\s+/g, ' ').trim(), fs: +(parseFloat(st.fontSize) * scale).toFixed(1), col: hex(st.color), on: under, own: !!own });
      }
      return;                                    // 文字项是原子的，不再往下拆
    }
    if (el.tagName === 'svg' || el.tagName === 'CANVAS') {
      if (vis && full.w * full.h >= 16) {
        let sig = 2166136261;
        const mix = (str) => { for (let i = 0; i < str.length; i++) { sig ^= str.charCodeAt(i); sig = Math.imul(sig, 16777619); } };
        // SVG 的指纹取「看得见的形状」算出来的位置与样式。不取标记文本：补间库会留下不影响画面的内联样式；
        // 不取看不见的形状：透明或隐藏的形状常常停在上一次用到它时的位置，那不算画面的一部分
        let shapes = 0;
        if (el.tagName === 'svg') {
          const sv = (node, op) => { for (const sh of node.children) { const c = getComputedStyle(sh); if (c.display === 'none') continue; const q = op * parseFloat(c.opacity || '1'); if (q < 0.03) continue;
            if (sh.tagName === 'g' || sh.tagName === 'svg') { sv(sh, q); continue; }
            if (c.visibility === 'hidden' || (c.fill === 'none' && (c.stroke === 'none' || parseFloat(c.strokeWidth) === 0))) continue;
            const r = sh.getBoundingClientRect();
            if ((r.width < 0.5 && r.height < 0.5) || r.right < 0 || r.bottom < 0 || r.left > 1920 || r.top > 1080 || ++shapes > 800) continue;   // 缩到零的、在画外的也不算
            mix([Math.round(r.left / 2), Math.round(r.top / 2), Math.round(r.width / 2), Math.round(r.height / 2), Math.round(q * 20), c.fill, c.stroke, Math.round(parseFloat(c.strokeDashoffset) || 0), sh.getAttribute('d') || (sh.tagName === 'text' ? sh.textContent : '')].join(',') + '|'); } };
          sv(el, 1);
        }
        else { try { const c = COLLECT.cv || (COLLECT.cv = document.createElement('canvas')); c.width = 96; c.height = 54; const g = c.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, 96, 54); g.drawImage(el, 0, 0, 96, 54); const d = g.getImageData(0, 0, 96, 54).data; for (let i = 0; i < d.length; i++) { sig ^= d[i] >> 3; sig = Math.imul(sig, 16777619); } } catch (e) { sig = 0; } }
        if (el.tagName === 'CANVAS' || shapes) out.push({ k: 'gfx', ...base(), kind: el.tagName.toLowerCase(), n: shapes, sig: (sig >>> 0).toString(16) });
      }
      if (el.tagName === 'CANVAS') return;
    }
    let stack = bgStack;
    if (!structural && bg && !bg.includes('@') && vis && full.w * full.h >= 400) { out.push({ k: 'block', ...base(), bg }); stack = bgStack.concat(bg); }
    else if (structural && bg && !bg.includes('@')) stack = bgStack.concat(bg);
    else if (el.hasAttribute('data-name') && vis && el.tagName !== 'svg') out.push({ k: 'named', ...base() });
    if (svgEl && el.tagName !== 'svg' && el.tagName !== 'g') return;          // SVG 里只往 <g> 里走：带 data-name 的形状各记一项，其余由所在 <svg> 的指纹代表
    const c2 = (!svgEl && cs.overflow !== 'visible' && vis) ? vis : clip;
    if (!vis && !svgEl && cs.overflow !== 'visible') return;
    for (const c of kids) walk(c, o, c2, stack);
  };
  walk(stage, 1, STAGE, []);
  return out;
}

// ── Node 侧 ──
const lum = (hexc) => { const v = [1, 3, 5].map((i) => parseInt(hexc.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const overlap = (a, b) => { const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y), r = Math.min(a.x + a.w, b.x + b.w), bt = Math.min(a.y + a.h, b.y + b.h); return r > x && bt > y ? (r - x) * (bt - y) : 0; };
// 文字项量到的是行框，上下各有一截空白（大号数字尤其明显）；判断重叠时按字形大致占的范围算：上下各收 14%
// 只算落在画面内的部分：透视或大倍率特写时，离镜头很近的文字的外接框会比画面大成千上万倍
const glyphBox = (t) => { const x = Math.max(0, t.x), y = Math.max(0, t.y + t.h * 0.14), r = Math.min(W, t.x + t.w), b = Math.min(H, t.y + t.h * 0.86); return { x, y, w: Math.max(0, r - x), h: Math.max(0, b - y) }; };

// 文字项实际压在哪个底色上：取「在它之前绘制、且盖住它中心点」的最后一个色块；没有就用祖先链上的底色，再没有就是纸色
function backdrop(t, items, paper) {
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2; let bg = t.on || paper;
  if (t.own) return bg;                          // 文字自带底色
  for (const b of items) { if (b.k !== 'block' || b.i > t.i || b.op < 0.6) continue; if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) bg = b.bg; }
  return bg;
}

// 单帧的问题清单。返回 [{code, key, msg}]；key 用来跨帧合并同一个问题
function problems(items, paper) {
  const out = [], texts = items.filter((x) => x.k === 'text' && x.op >= 0.5);
  for (const t of texts) {
    const tag = `「${t.text.slice(0, 18)}」(${t.name})`;
    if (t.cutByStage && !t.bleed) out.push({ code: 'CUT', key: 'CUT|' + t.text.slice(0, 24), msg: `文字被画面边缘切掉 ${tag} 位置 x=${t.x} y=${t.y} w=${t.w} h=${t.h}` });
    if (t.y + t.h > CAP_TOP + 2 && t.y < H && t.x + t.w > 0 && t.x < W) out.push({ code: 'CAPZONE', key: 'CAPZONE|' + t.text.slice(0, 24), msg: `文字伸进了字幕条（y>${CAP_TOP}）${tag} 底边 y=${t.y + t.h}` });
    if (t.fs < CFG.min_font) out.push({ code: 'SMALL', key: 'SMALL|' + t.text.slice(0, 24), msg: `字号过小 ${t.fs}px（<${CFG.min_font}）${tag}` });
    if (CFG.margin && !t.bleed && !t.cutByStage && t.scene !== 'caption' && (t.x < CFG.margin - 1 || t.x + t.w > W - CFG.margin + 1)) out.push({ code: 'MARGIN', key: 'MARGIN|' + t.text.slice(0, 24), msg: `文字贴近画面左右边缘（留边 <${CFG.margin}px）${tag} x=${t.x}–${t.x + t.w}` });
    if (t.col && /^#[0-9A-F]{6}$/.test(t.col)) {
      const bg = backdrop(t, items, paper);
      if (bg && /^#[0-9A-F]{6}$/.test(bg)) { const c = contrast(t.col, bg), need = t.fs >= 56 ? 3 : 4.5; if (c < need) out.push({ code: 'CONTRAST', key: 'CONTRAST|' + t.text.slice(0, 24), need, tag, rect: { x: t.x, y: t.y, w: t.w, h: t.h }, guess: t.col + '/' + bg, msg: `对比度不足 ${c.toFixed(1)}:1（需 ≥${need}）${tag} 字色 ${t.col} 底色 ${bg}` }); }
    }
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j]; if (a.ovok || b.ovok) continue;
    if (a.text === b.text && Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2 && Math.abs(a.w - b.w) < 2) continue;   // 同一行字叠两层（反色、描边等做法），不算重叠
    if (a.w * a.h > W * H * 4 || b.w * b.h > W * H * 4) continue;        // 比画面大出数倍的文字是掠过镜头的近景，不参与重叠判断
    const ga = glyphBox(a), gb = glyphBox(b), ov = overlap(ga, gb); if (!ov || ga.w * ga.h < 1 || gb.w * gb.h < 1) continue;
    const frac = ov / Math.min(ga.w * ga.h, gb.w * gb.h);
    if (frac > 0.2) out.push({ code: 'OVERLAP', key: 'OVERLAP|' + [a.text.slice(0, 16), b.text.slice(0, 16)].sort().join('|'), msg: `两段文字重叠 ${(frac * 100).toFixed(0)}%：「${a.text.slice(0, 18)}」(x=${a.x} y=${a.y} w=${a.w} h=${a.h}) 与 「${b.text.slice(0, 18)}」(x=${b.x} y=${b.y} w=${b.w} h=${b.h})` });
  }
  return out;
}

// 一帧的文字描述
function describe(items) {
  const lines = [];
  const f = (x) => `x=${String(x.x).padStart(5)} y=${String(x.y).padStart(5)} w=${String(x.w).padStart(5)} h=${String(x.h).padStart(4)}`;
  for (const x of items) {
    const op = x.op < 0.995 ? ` 不透明度 ${x.op}` : '';
    if (x.k === 'cap') lines.push(`  [字幕] ${x.text ? '「' + x.text + '」' : '（空）'}${op}`);
    else if (x.k === 'text') lines.push(`  [文字] ${f(x)}  ${x.fs}px ${x.col}${op}${x.cut ? ' 被裁:' + x.cut : ''}  「${x.text.slice(0, 60)}」  <${x.name}>${x.scene ? ' @' + x.scene : ''}`);
    else if (x.k === 'block') lines.push(`  [色块] ${f(x)}  底色 ${x.bg}${op}${x.cut ? ' 被裁:' + x.cut : ''}  <${x.name}>${x.scene ? ' @' + x.scene : ''}`);
    else if (x.k === 'gfx') lines.push(`  [绘图] ${f(x)}${op}${x.cut ? ' 被裁:' + x.cut : ''}  ${x.kind === 'svg' ? `SVG（${x.n} 个可见形状）` : 'canvas'}，内容看截图  <${x.name}>${x.scene ? ' @' + x.scene : ''}`);
    else lines.push(`  [图形] ${f(x)}${op}${x.cut ? ' 被裁:' + x.cut : ''}  <${x.name}>${x.scene ? ' @' + x.scene : ''}`);
  }
  return lines.join('\n');
}
// 用来判断「画面有没有变」的签名：不含字幕；位置取整到 2px
const signature = (items) => items.filter((x) => x.k !== 'cap').map((x) => [x.k, x.name, Math.round(x.x / 2), Math.round(x.y / 2), Math.round(x.w / 2), Math.round(x.h / 2), Math.round(x.op * 20), x.text || '', x.col || x.bg || x.sig || ''].join(',')).join(';');

// 按实际像素复核 CONTRAST：截下文字所在的那一小块，取出现最多的颜色当底色、与它反差最大的常见颜色当字色。
// 页面必须还停在产生这些问题的那一刻。cache 跨帧复用（同一段文字在同一位置、同一推断下只量一次）。
const sessions = new WeakMap();
async function refine(page, ps, cache = new Map()) {
  const out = [];
  for (const p of ps) {
    if (p.code !== 'CONTRAST') { out.push(p); continue; }
    const r = p.rect, ck = [p.key, r.x, r.y, r.w, r.h, p.guess].join('|');
    if (!cache.has(ck)) {
      let res = null;
      try {
        let cdp = sessions.get(page); if (!cdp) { cdp = await page.createCDPSession(); sessions.set(page, cdp); }
        const x = Math.max(0, r.x - 2), y = Math.max(0, r.y - 2), w = Math.min(W - x, r.w + 4), h = Math.min(H - y, r.h + 4);
        if (w > 2 && h > 2) {
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x, y, width: w, height: h, scale: 1 } });
          const im = require('./pngfix').decode(Buffer.from(data, 'base64')), hist = new Map(), n = im.w * im.h;
          for (let i = 0; i < n; i++) { const o = i * im.ch, k = (im.px[o] >> 4) << 8 | (im.px[o + 1] >> 4) << 4 | (im.px[o + 2] >> 4); const e = hist.get(k) || [0, 0, 0, 0]; e[0]++; e[1] += im.px[o]; e[2] += im.px[o + 1]; e[3] += im.px[o + 2]; hist.set(k, e); }
          const cols = [...hist.values()].map((e) => ({ n: e[0], hex: '#' + [1, 2, 3].map((i) => Math.round(e[i] / e[0]).toString(16).padStart(2, '0')).join('').toUpperCase() })).sort((a, b) => b.n - a.n);
          const bg = cols[0], min = Math.max(6, n * 0.006); let best = null;
          for (const c of cols.slice(1)) { if (c.n < min) continue; const k = contrast(c.hex, bg.hex); if (!best || k > best.k) best = { k, hex: c.hex }; }
          res = best ? { ratio: best.k, fg: best.hex, bg: bg.hex } : { ratio: 1, fg: bg.hex, bg: bg.hex };
        }
      } catch (e) { res = null; }
      cache.set(ck, res);
    }
    const m = cache.get(ck);
    if (!m) { out.push(p); continue; }                       // 量不了（在画外等）：保留按 DOM 推断的结论
    if (m.ratio >= p.need) continue;                           // 实际像素合格：DOM 推断的底色不对，丢掉这一条
    out.push({ ...p, msg: `对比度不足 ${m.ratio.toFixed(1)}:1（需 ≥${p.need}，按截图实测）${p.tag} 字色约 ${m.fg} 底色约 ${m.bg}` });
  }
  return out;
}

module.exports = { COLLECT, problems, refine, describe, signature, configure, CFG, W, H, CAP_TOP };
