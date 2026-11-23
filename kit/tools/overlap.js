// 压盖与间距：逐帧找画面上「字压字、色块或线条盖住字、字跨在别的框边上、字被容器裁掉、术语注解贴着别的东西」。
// scan.js 的 OVERLAP 只报连续多帧、成对文字的重叠；色块、图标、线条盖住字，注解与旁边的东西挤在一起，它都不报。
// 这里按真实的绘制层次查（elementsFromPoint），每一类都给出时段，便于逐条修：
//   TT     两段不同元素的文字外框相交（字身各自上下收掉 15%；先裁到 overflow 不可见的祖先里）
//   COVER  文字中线上的采样点，最上层是别的有底色的元素、图片或 SVG 线条
//   EDGE   文字一部分在别的有底色的框里、一部分在框外（跨在框边上）
//   CLIP   文字伸出 overflow 不可见的祖先（被裁掉一截）
//   TIGHT  术语注解（data-gloss）与不相干的文字或色块的间距小于 --gap；注解整个放在一块底板上不算
// 文字放在自己的不透明底板上、底板又画在别的元素之后的（例如贴在页上的白底放大框），不算压盖。
// 有意的压盖（删除线、正在飞行的一块、半透明的高亮条）也会报出来：逐条看过，修掉或写明为什么保留。
// 用法：node kit/tools/overlap.js <视频> [--step 0.25] [--from 秒 --to 秒] [--gap 24] [--min 0.4] [--workers 4] [--lang zh]
//   --min：持续不足这么多秒的不报（只看停住的压盖）；缺省 0，全部报出，含飞行与交叉淡变的中间帧
const { needVideo, LANGS, layout, startServer, openPage, arg } = require('./lib');

function probe(GAP) {
  const out = [];
  const S = document.getElementById('stage').getBoundingClientRect();
  const root = document.getElementById('scenes') || document.getElementById('stage');
  const effOp = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= +cs.opacity; if (n.id === 'stage') break; } return o; };
  const opCache = new Map(); const op = (e) => { if (!opCache.has(e)) opCache.set(e, effOp(e)); return opCache.get(e); };
  const painted = (e) => {
    if (e instanceof SVGElement) { if (e.tagName === 'svg') return false; const cs = getComputedStyle(e); return (cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) || (cs.fill !== 'none' && !/rgba\(0, 0, 0, 0\)/.test(cs.fill)); }
    const cs = getComputedStyle(e); const bg = cs.backgroundColor;
    if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { const a = bg.match(/rgba\([^)]*,\s*([\d.]+)\)/); if (!a || +a[1] > 0.15) return true; }
    return cs.backgroundImage && cs.backgroundImage !== 'none' && !/gradient/.test(cs.backgroundImage) ? true : e.tagName === 'IMG';
  };
  const nm = (e) => { const s = (e.textContent || '').trim().replace(/\s+/g, ' '); return (s.slice(0, 28) || (e.className && e.className.baseVal != null ? e.tagName : String(e.className || e.tagName))).replace(/\|/g, '/'); };
  const inStage = (e) => !e.closest('#caption, #captions, .caption, #hud, .chrome');
  const texts = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || !inStage(el) || el.closest('svg')) continue;
    if (op(el) < 0.3) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const q of rg.getClientRects()) {
      if (q.width < 3 || q.height < 6) continue;
      if (q.right < S.left || q.left > S.right || q.bottom < S.top || q.top > S.bottom) continue;
      const ih = q.height * 0.15;
      let L = q.left + 1, R = q.right - 1, Tt = q.top + ih, B = q.bottom - ih;
      for (let a = el; a && a !== root; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue; const c = a.getBoundingClientRect(); L = Math.max(L, c.left); R = Math.min(R, c.right); Tt = Math.max(Tt, c.top); B = Math.min(B, c.bottom); }
      if (R - L < 3 || B - Tt < 3) continue;
      texts.push({ el, l: L, r: R, t: Tt, b: B, raw: { l: q.left + 1, r: q.right - 1, t: q.top + ih, b: q.bottom - ih }, txt: n.textContent.trim().slice(0, 24) });
    }
  }
  const rel = (a, b) => a === b || a.contains(b) || b.contains(a);
  const backing = (el) => { for (let n = el; n && n !== root; n = n.parentElement) if (painted(n) && op(n) >= 0.2) return n; return null; };
  const above = (A, B) => !A.contains(B) && !B.contains(A) && !!(B.compareDocumentPosition(A) & Node.DOCUMENT_POSITION_FOLLOWING);
  const covers = (bk, r) => { const q = bk.getBoundingClientRect(); return q.left <= r.l + 1 && q.right >= r.r - 1 && q.top <= r.t + 1 && q.bottom >= r.b - 1; };
  const hidesUnder = (T, other) => { const bk = backing(T.el); return bk && above(bk, other) && covers(bk, T); };
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const A = texts[i], B = texts[j]; if (rel(A.el, B.el)) continue;
    { const ba = backing(A.el), bb = backing(B.el); if ((ba && above(ba, B.el) && covers(ba, B)) || (bb && above(bb, A.el) && covers(bb, A))) continue; }
    const w = Math.min(A.r, B.r) - Math.max(A.l, B.l), hh = Math.min(A.b, B.b) - Math.max(A.t, B.t);
    if (w > 2 && hh > 2) out.push({ k: 'TT', a: A.txt, b: B.txt, x: Math.round(Math.max(A.l, B.l)), y: Math.round(Math.max(A.t, B.t)) });
  }
  for (const T of texts) {
    const y = (T.t + T.b) / 2; let hit = null;
    for (const f of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      if (hit) break;
      for (const e of document.elementsFromPoint(T.l + (T.r - T.l) * f, y)) {
        if (e === T.el || T.el.contains(e) || e.contains(T.el)) break;
        if (!inStage(e) || e.id === 'bg' || e.id === 'stage') continue;
        if (op(e) < 0.2 || !painted(e)) continue;
        const r = e.getBoundingClientRect(); if (r.width > 1800 && r.height > 900) continue;
        hit = e; break;
      }
    }
    if (hit) out.push({ k: 'COVER', a: T.txt, b: hit instanceof SVGElement ? 'svg:' + hit.tagName : nm(hit), x: Math.round(T.l), y: Math.round(T.t) });
  }
  const boxes = [...root.querySelectorAll('*')].filter((e) => !(e instanceof SVGElement) && inStage(e) && op(e) >= 0.2 && painted(e)).map((e) => ({ e, r: e.getBoundingClientRect() })).filter((b) => b.r.width >= 8 && b.r.height >= 8 && !(b.r.width > 1800 && b.r.height > 900));
  for (const T of texts) {
    const area = (T.r - T.l) * (T.b - T.t);
    for (const B of boxes) {
      if (B.e.contains(T.el) || T.el.contains(B.e) || hidesUnder(T, B.e)) continue;
      const w = Math.min(T.r, B.r.right) - Math.max(T.l, B.r.left), hh = Math.min(T.b, B.r.bottom) - Math.max(T.t, B.r.top);
      if (w <= 2 || hh <= 2) continue;
      const f = (w * hh) / area; if (f > 0.04 && f < 0.96) out.push({ k: 'EDGE', a: T.txt, b: nm(B.e), x: Math.round(T.l), y: Math.round(T.t) });
    }
  }
  for (const T of texts) {
    for (let n = T.el.parentElement; n && n !== root; n = n.parentElement) {
      const cs = getComputedStyle(n); if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const r = n.getBoundingClientRect();
      if (T.raw.l < r.left - 1 || T.raw.r > r.right + 1 || T.raw.t < r.top - 1 || T.raw.b > r.bottom + 1) { out.push({ k: 'CLIP', a: T.txt, b: nm(n), x: Math.round(T.l), y: Math.round(T.t) }); break; }
    }
  }
  const others = boxes.concat(texts.map((t) => ({ e: t.el, r: { left: t.l, right: t.r, top: t.t, bottom: t.b } })));
  for (const g of root.querySelectorAll('[data-gloss]')) {
    if (op(g) < 0.3) continue; const R = g.getBoundingClientRect(); let best = null;
    for (const o of others) {
      if (g.contains(o.e) || o.e.contains(g)) continue;
      if (o.r.left <= R.left && o.r.right >= R.right && o.r.top <= R.top && o.r.bottom >= R.bottom) continue;
      const d = Math.hypot(Math.max(o.r.left - R.right, R.left - o.r.right, 0), Math.max(o.r.top - R.bottom, R.top - o.r.bottom, 0));
      if (d < GAP && (!best || d < best.d)) best = { d, o };
    }
    if (best) out.push({ k: 'TIGHT', a: nm(g), b: nm(best.o.e) + ' ' + Math.round(best.d) + 'px', x: Math.round(R.left), y: Math.round(R.top) });
  }
  return out;
}

(async () => {
  needVideo();
  const lang = arg('lang', LANGS()[0]), { L } = layout(lang);
  const step = +arg('step', 0.25), from = +arg('from', 0), to = +arg('to', L.total), gap = +arg('gap', 24), minDur = +arg('min', 0), W = Math.max(1, +arg('workers', 4));
  const { server, base } = await startServer();
  const times = []; for (let t = from; t < to; t += step) times.push(+t.toFixed(2));
  const chunk = Math.ceil(times.length / W), parts = [];
  for (let w = 0; w < W && w * chunk < times.length; w++) parts.push(times.slice(w * chunk, (w + 1) * chunk));
  const results = await Promise.all(parts.map(async (ts) => {
    const { browser, page } = await openPage(base, { lang });
    await page.addStyleTag({ content: '#stage *{pointer-events:auto!important} svg *{pointer-events:visiblePainted!important} #caption,#caption *,#captions,#captions *,#hud,#hud *{pointer-events:none!important}' });
    const got = [];
    for (const t of ts) { await page.evaluate((x) => window.seek(x), t); for (const f of await page.evaluate(probe, gap)) got.push({ ...f, t }); }
    await browser.close(); return got;
  }));
  server.close();
  const hits = new Map(), rows = [];
  for (const f of results.flat().sort((a, b) => a.t - b.t)) {
    const key = f.k + '|' + f.a + '|' + f.b, h = hits.get(key);
    if (!h || f.t - h.t1 > step * 1.6) { if (h) rows.push({ ...h }); hits.set(key, { ...f, t0: f.t, t1: f.t }); } else h.t1 = f.t;
  }
  rows.push(...hits.values());
  const list = rows.filter((h) => h.t1 - h.t0 + step >= minDur).sort((a, b) => a.t0 - b.t0);
  for (const h of list) console.log(`${h.k.padEnd(5)} ${h.t0.toFixed(2)}–${h.t1.toFixed(2)}s  @${h.x},${h.y}  「${h.a}」×「${h.b}」`);
  const n = {}; for (const h of list) n[h.k] = (n[h.k] || 0) + 1;
  console.log(`共 ${list.length} 处` + (list.length ? '（' + Object.entries(n).map(([k, v]) => k + ' ' + v).join('、') + '）' : ''));
})();
