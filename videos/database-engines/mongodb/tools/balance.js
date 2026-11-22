// 版面平衡检查：每隔一段时间取一帧，找带边框或底色的容器里，内容贴死右边（或左边）、左右留白不对称、或伸出容器的地方。
// scan.js 只看文字互相重叠与出画，看不出「三块挤在框里、最右一块顶住边框」这类问题（策划者 r6：「向右顶死不平衡的bug 视频里挺多的」）。
// 用法：node videos/database-engines/mongodb/tools/balance.js videos/database-engines/mongodb [--step 1] [--from 0 --to 1082]
const lib = require('../../../../kit/tools/lib');
const { needVideo, LANGS, layout, startServer, openPage, arg } = lib;
(async () => {
  needVideo();
  const lang = LANGS()[0], { L } = layout(lang);
  const step = +arg('step', 1), from = +arg('from', 0), to = +arg('to', L.total);
  const { server, base } = await startServer();
  const { browser, page } = await openPage(base, { lang });
  const hits = new Map();
  for (let t = from; t < to; t += step) {
    await page.evaluate((x) => window.seek(x), +t.toFixed(2));
    const found = await page.evaluate(() => {
      const out = [];
      const vis = (e) => { for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
      // 只算两边都有边框、或有底色的框（左边一条竖线的注解不算）
      const boxed = (cs) => {
        const both = parseFloat(cs.borderLeftWidth) > 0 && parseFloat(cs.borderRightWidth) > 0 && cs.borderLeftStyle !== 'none' && cs.borderRightStyle !== 'none';
        const bg = cs.backgroundColor; const hasBg = bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg);
        return both || hasBg;
      };
      const all = [...document.querySelectorAll('#stage *')].filter((e) => !e.closest('.chrome, #hud, .caption, #captions, svg'));
      const order = new Map(all.map((e, i) => [e, i]));
      for (const el of all) {
        const cs = getComputedStyle(el); if (!boxed(cs) || !vis(el)) continue;
        const r = el.getBoundingClientRect(); if (r.width < 60 || r.height < 24 || r.width > 1700) continue;
        // 内容的外框：可见的子元素与文字
        let L = Infinity, R = -Infinity, n = 0;
        const walk = (node) => {
          for (const c of node.childNodes) {
            if (c.nodeType === 3 && c.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(c); for (const q of rg.getClientRects()) { if (q.width < 1) continue; L = Math.min(L, q.left); R = Math.max(R, q.right); n++; } }
            else if (c.nodeType === 1) {
              const s2 = getComputedStyle(c); if (s2.display === 'none' || s2.visibility === 'hidden' || +s2.opacity < 0.05 || s2.position === 'absolute' && c.dataset.name === 'ring') continue;
              const q = c.getBoundingClientRect(); if (q.width < 2 || q.height < 2) continue;
              if (boxed(s2) || c.children.length === 0) { L = Math.min(L, q.left); R = Math.max(R, q.right); n++; } else walk(c);
            }
          }
        };
        walk(el);
        // 叠在框里的兄弟元素（不是子元素、画在框之上、整个落在框的上下范围里、横向至少一半在框里）也算框里的内容
        for (const o of all) {
          if (o === el || el.contains(o) || o.contains(el) || order.get(o) < order.get(el)) continue;
          const s2 = getComputedStyle(o); if (!boxed(s2) || !vis(o)) continue;
          const q = o.getBoundingClientRect(); if (q.width < 20 || q.height < 16 || q.width > r.width) continue;
          if (q.top < r.top - 1 || q.bottom > r.bottom + 1) continue;
          const ov = Math.min(q.right, r.right) - Math.max(q.left, r.left); if (ov < q.width * 0.5) continue;
          L = Math.min(L, q.left); R = Math.max(R, q.right); n++;
        }
        if (!n) continue;
        const inL = r.left + parseFloat(cs.borderLeftWidth), inR = r.right - parseFloat(cs.borderRightWidth);
        const gl = L - inL, gr = inR - R;
        const name = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40) || el.className;
        if (gr < -1.5) out.push({ k: 'OUT', name, gl: Math.round(gl), gr: Math.round(gr), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) });
        else if (gl >= 10 && gr < Math.max(3, gl * 0.25) && R - L > r.width * 0.4) out.push({ k: 'RIGHT', name, gl: Math.round(gl), gr: Math.round(gr), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) });
        else if (gr >= 10 && gl < 2 && R - L < r.width * 0.9) out.push({ k: 'LEFT', name, gl: Math.round(gl), gr: Math.round(gr), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) });
      }
      return out;
    });
    for (const f of found) { const key = f.k + '|' + f.name + '|' + f.x + ',' + f.y; if (!hits.has(key)) hits.set(key, { ...f, t0: +t.toFixed(1), t1: +t.toFixed(1) }); else hits.get(key).t1 = +t.toFixed(1); }
  }
  await browser.close(); server.close();
  const list = [...hits.values()].sort((a, b) => a.t0 - b.t0);
  for (const h of list) console.log(`${h.k.padEnd(5)} ${h.t0}–${h.t1}s  左 ${h.gl} 右 ${h.gr}  @${h.x},${h.y} w${h.w}  「${h.name}」`);
  console.log(`共 ${list.length} 处`);
})();
