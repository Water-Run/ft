// 本片的部件：内存 / 磁盘两大块、页、根页、字节条、泳道、锁、SQL 行、手册式粗箭头。
// 图形语言（全片不换义）：方块 = 页（青色填充 = 装了多少）；横条 = 一行的一个版本（实心蓝 = 已提交，砖红斜纹 = 未提交）；
// 砖红虚框 = 在等；挂锁 = 行锁；泳道 = 一个人（一个会话），从左往右是时间，竖线是此刻。
const D = window.DATA;
const PK_LEAVES = D.pk.leaves.map((l) => l.page);            // 21 页主键叶子，按键的顺序
const NM_LEAVES = D.nm.leaves.map((l) => l.page);            // 16 页姓名索引叶子

// 内存 / 磁盘两大块
function zone(parent, x, y, w, hh, zh, en) {
  const z = h('div', 'zone', parent, `<div class="zt">${zh}</div><div class="ze">${en}</div>`);
  px(z, x, y, w, hh); return z;
}
function boxEl(parent, x, y, w, hh, title, o = {}) {
  const b = h('div', 'box' + (o.dashed ? ' dashed' : ''), parent, title ? `<div class="bt">${title}</div>` : '');
  px(b, x, y, w, hh); return b;
}
// 一个页方块；fill(t) 可以随时间变
function pageBox(parent, x, y, w, hh, no, o = {}) {
  const p = h('div', 'pg', parent, `<div class="fill"></div>${no != null ? `<div class="no">${no}</div>` : ''}${o.cnt ? '<div class="cnt"></div>' : ''}`);
  px(p, x, y, w, hh);
  p.dataset.name = '页' + (no != null ? no : '');
  p.fillEl = p.querySelector('.fill'); p.cntEl = p.querySelector('.cnt');
  if (o.fill != null) p.fillEl.style.height = (o.fill * 100).toFixed(1) + '%';
  if (o.cnt && o.n != null) p.cntEl.textContent = o.n;
  return p;
}
// 页里装了多少随 t 变：nOf(t) 给出这一页此刻的行数，cap 是一页的容量
function pageFill(p, nOf, cap) {
  let last = -1;
  F((t) => { const n = nOf(t); if (n === last) return; last = n; p.fillEl.style.height = (100 * clamp(n / cap)).toFixed(1) + '%'; if (p.cntEl) p.cntEl.textContent = n > 0 ? n : ''; });
}
function sq(parent, x, y, label, cls = '') {
  const e = h('div', 'sq ' + cls, parent, label != null ? `<div class="l">${label}</div>` : ''); px(e, x, y); e.dataset.name = '页' + (label != null ? label : ''); return e;
}
// 字节条：fields = [{ k, hx, v, cls, w }]
function byteStrip(parent, x, y, fields) {
  const s = h('div', 'bytes', parent); px(s, x, y);
  s.f = fields.map((f) => { const e = h('div', 'fld ' + (f.cls || ''), s, `<div class="k">${f.k}</div><div class="hx">${f.hx || ''}</div>${f.v != null ? `<div class="v">${f.v}</div>` : ''}`); if (f.w) e.style.width = f.w + 'px'; return e; });
  return s;
}
const hexSp = (hx) => hx.match(/../g).join(' ');

// 泳道：names 自上而下；pts = [[t, x], …] 把时间映到横坐标（分段线性），播放头按它走
function lanes(parent, o) {
  const L0 = { x: o.x || 120, y: o.y || 600, w: o.w || 1680, gap: o.gap || 160, rowH: o.rowH || 120, names: o.names, pts: o.pts };
  const x0 = L0.x + L0.gap, x1 = L0.x + L0.w;
  const X = (t) => { const P = L0.pts; if (t <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (t <= P[i][0]) return lerp(P[i - 1][1], P[i][1], (t - P[i - 1][0]) / Math.max(1e-6, P[i][0] - P[i - 1][0])); return P[P.length - 1][1]; };
  const Y = (i) => L0.y + i * L0.rowH;
  const els = { names: [], lines: [] };
  L0.names.forEach((nm, i) => {
    const n = h('div', 'lane-name', parent, nm); px(n, L0.x, Y(i) - 20); els.names.push(n);
    const ln = h('div', 'lane-line', parent); px(ln, x0, Y(i) - 1, x1 - x0); els.lines.push(ln);
  });
  const api = {
    X, Y, x0, x1, els,
    // 泳道和名字一起刷出
    enter(t) { els.names.forEach((n, i) => slide(n, t + i * 0.1, { x: -40 })); els.lines.forEach((l, i) => wipe(l, t + i * 0.1, { dir: 'l', d: 0.7 })); },
    // 一个事件：在时刻 t、播放头走到这里时出现，文字居中在泳道上
    event(i, t, text, cls = '', dy = 0) {
      const e = h('div', 'pill ' + cls, parent, text); px(e, 0, 0);
      const w = e.offsetWidth, hh = e.offsetHeight; px(e, X(t) - w / 2, Y(i) - hh / 2 + dy);
      slam(e, t, { from: 1.25, d: 0.35 }); return e;
    },
    // 一根随播放头生长的横条（某个版本、某段等待）：从 tA 长到 tB；y 是条的上沿
    bar(y, tA, tB, html, cls = '', o = {}) {
      const e = h('div', 'vbar ' + cls, parent, html); px(e, X(tA), y);
      const xa = X(tA);
      let last = -1;
      F((t) => {
        const on = t >= tA; const xb = X(Math.min(t, o.until != null ? o.until : tB));
        const w = on ? Math.max(0, Math.round(xb - xa)) : 0;
        if (w === last) return; last = w; e.style.width = w + 'px'; e.style.visibility = w > 2 ? 'visible' : 'hidden';
      });
      return e;
    },
    // 播放头：从 tA 走到 tB，停在终点淡出（0.3 秒），不在一帧里消失
    playhead(tA, tB, top, bottom) {
      const p = h('div', 'playhead', parent); px(p, 0, top, null, bottom - top);
      let last = null;
      F((t) => {
        const on = t >= tA && t <= tB + 0.3; const x = Math.round(X(Math.min(t, tB))); const a = on ? Math.round(20 * (1 - clamp((t - tB) / 0.3))) / 20 : 0;
        const k = on ? x + '|' + a : -1; if (k === last) return; last = k;
        p.style.visibility = on && a > 0 ? 'visible' : 'hidden'; p.style.left = x + 'px'; p.style.opacity = a;
      });
      return p;
    },
  };
  return api;
}

// 小挂锁
function lockAt(parent, x, y, cls = '') { const e = h('div', 'lock ' + cls, parent); px(e, x, y); e.dataset.name = '锁'; return e; }

// SQL 一行：关键字着色
function sqlLine(parent, x, y, text, o = {}) {
  const html = esc(text).replace(/\b(START TRANSACTION|UPDATE|SET|WHERE|ROLLBACK|COMMIT|SELECT|FROM|FOR SHARE|FOR UPDATE|DELETE|INSERT INTO|VALUES|BETWEEN|AND)\b/g, '<span class="kw">$1</span>');
  const e = h('div', 'sql', parent, html); px(e, x, y); if (o.size) e.style.fontSize = o.size + 'px'; return e;
}

// 手册架构图那种粗箭头：尾巴两道竖杠，水平方向；返回 SVG 组，可整体 wipe
function bigArrow(ov, x1, y, x2, hh, color = '#2D5A68') {
  const g = svg('g', {}, ov);
  const b = 8, gap = 5, head = Math.min(hh * 0.9, Math.abs(x2 - x1) * 0.4), dir = x2 > x1 ? 1 : -1;
  const xa = x1 + dir * (2 * b + 2 * gap);
  svg('rect', { x: dir > 0 ? x1 : x1 - b, y: y - hh / 2, width: b, height: hh, fill: color }, g);
  svg('rect', { x: dir > 0 ? x1 + b + gap : x1 - 2 * b - gap, y: y - hh / 2, width: b, height: hh, fill: color }, g);
  svg('path', { d: `M${xa},${y - hh / 2} L${x2 - dir * head},${y - hh / 2} L${x2 - dir * head},${y - hh} L${x2},${y} L${x2 - dir * head},${y + hh} L${x2 - dir * head},${y + hh / 2} L${xa},${y + hh / 2} z`, fill: color }, g);
  return g;
}
// 竖直方向的粗箭头
function bigArrowV(ov, x, y1, y2, ww, color = '#2D5A68') {
  const g = bigArrow(ov, y1, x, y2, ww, color);
  g.setAttribute('transform', `matrix(0,1,1,0,0,0)`);            // 交换 x、y：把水平箭头翻成竖直
  return g;
}
// SVG 元素的显隐与淡入（SVG 组不能用 clip-path 的 inset 百分比时用它）
function svgIn(e, t, d = 0.45) { tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: d, ease: 'power2.out', immediateRender: true }, t); return e; }
function svgOut(e, t, d = 0.35) { tl.to(e, { opacity: 0, duration: d, ease: 'power2.in' }, t); }

// 一段时间内高亮（类名），可多段
function lit(e, cls, t0, t1 = Infinity) { classAt(e, cls, t0, t1); return e; }
// 文字按时刻换（keyed 的简写）
function swaps(e, pairs) { const k = keyed(e); for (const [t, html] of pairs) k.at(t, { html }); return e; }

// 镜头（WaterRun 2026-10-25：「老毛病, 镜头一直在缩放....你不明白你直接参考MyISAM的不行?」；照 MyISAM 一集与 docs/guides/scenes.md 第 3 节）：
// 不缩放、不推近、不往复。本章内容在场的整段里（章节卡之后到场景结束），镜头只朝 dir 一个方向匀速横移 48 像素，
// 每秒不超过 2 像素（章越长越慢），不配音效；相邻两章 dir 取相反方向。画面停着时的变化靠内容的分步，不靠镜头。
function pan1(cam, s, dir = 1) {
  const t0 = s.first, t1 = s.end, PAN = 48, d = Math.max(PAN / 2, t1 - t0 - 0.05);   // 48 像素至少走 24 秒：不超过每秒 2 像素
  cam.track(t0, { x: 960 - dir * PAN / 2, y: 540, z: 1 }, [[t0, { x: 960 + dir * PAN / 2 }, d, { ease: 'none', sfx: false }]]);
}

// 注解：新名词、关键结构第一次出现时，画面上的一行说明（是什么、指哪一块、数字或出处），不等旁白。
// term 写进 data-gloss，供 scan.js 核对「标了星号的术语第一次出现时画面上有注解」；html 里第一段 <b> 是名词本身。
// o.w 宽度（缺省 520），o.src 出处（小一号另起一行）。
function gloss(parent, x, y, term, html, o = {}) {
  const e = h('div', 'gl', parent, html + (o.src ? `<div class="gl-src">${o.src}</div>` : '')); px(e, x, y, o.w || 520);
  if (term) e.dataset.gloss = term;
  return e;
}

// 对、错、断电三个记号：画成平涂的小图形，不用字体里的 emoji 与装饰符号（本片的源码规则）。size 是边长（px），color 是 CSS 颜色
const MARK = {
  ok: (size = 36, color = 'var(--main)') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:middle;overflow:visible"><path d="M4 12.5 L9.5 18 L20 6" style="fill:none;stroke:${color};stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round"/></svg>`,
  no: (size = 36, color = 'var(--acc)') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:middle;overflow:visible"><path d="M6 6 L18 18 M18 6 L6 18" style="fill:none;stroke:${color};stroke-width:3.2;stroke-linecap:round"/></svg>`,
  bolt: (size = 36, color = 'var(--acc)') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:middle;overflow:visible"><path d="M13.5 2 L4.5 13.5 H11 L9.5 22 L19.5 9.5 H13 Z" style="fill:${color}"/></svg>`,
};
