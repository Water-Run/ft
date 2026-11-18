// 本片的部件：深色代码卡、注解、页、文件带、字节格、连线。按本片视觉系统写（经验规则 F21），只在这一集用。
// 数据全部取自 research/FACTS.md：A04（47 字节逐段）、B03（集合树的分界）、B04（叶页大小）、D04/F05/F07（检查点后块的位置）。

const MDB = {
  // Alice 的 47 字节（A04）：[十六进制, 含义] 含义：len 长度、t 类型、name 字段名、val 值、end 结尾
  BSON: [['2f000000', 'len'], ['07', 't'], ['5f696400', 'name'], ['6afa6ca26f27506cfb0a4e81', 'val'], ['02', 't'], ['6e616d6500', 'name'], ['06000000', 'val'], ['416c69636500', 'val'], ['10', 't'], ['61676500', 'name'], ['2a000000', 'val'], ['00', 'end']],
  // 集合文件里的块（字节偏移，B03 B04 D04 F05 F07）
  FILE0: [[0, 4096, 'h'], [4096, 28672, 'l', '1–1224'], [28672, 53248, 'a', '1225–2448'], [53248, 65536, 'l', '2449–3123'], [65536, 86016, 'l', '3124–4096'], [86016, 90112, 'r', '根']],
};

// 注解：画面上解释术语的那一块（scan.js 的 GLOSS 按 data-gloss 核对）
function gloss(e, term) { e.dataset.gloss = term; return e; }
function note(parent, x, y, html, cls = '') { const e = h('div', 'note ' + cls, parent, html); px(e, x, y); return e; }
function chip(parent, x, y, txt, cls = '') { const e = h('div', 'chip ' + cls, parent, txt); px(e, x, y); return e; }
function label(parent, x, y, txt, cls = 'lab') { const e = h('div', 'abs ' + cls, parent, txt); px(e, x, y); return e; }

// 深色代码卡（官网 mongosh 卡）：返回 { c, body, line(html) }，line 追加一行并返回它
function codeCard(parent, x, y, w, title, hh) {
  const c = h('div', 'card', parent); px(c, x, y, w, hh);
  h('div', 'bar', c, title);
  const body = h('div', 'body', c);
  return { c, body, line(html) { return h('div', '', body, html); } };
}

// 页
function pg(parent, x, y, w, hh, txt = '', cls = '') { const e = h('div', 'pg ' + cls, parent, txt); px(e, x, y, w, hh); return e; }

// 文件带：按真实偏移排开，4 KB 一格。kind：h 文件头、l 叶页、a 正在讲的叶页、r 根页、f 空出、d Dave 那一页
const BLK = {
  h: { background: '#C1C7C6' }, l: { background: '#FFFFFF', border: '1.5px solid #C1C7C6' }, a: { background: '#00ED64' },
  r: { background: '#023430' }, f: { background: 'transparent', border: '2px dashed #5C6C75' }, d: { background: '#71F6BA' }, o: { background: '#E3FCF7', border: '1.5px solid #00684A' },
};
function fileBand(parent, x, y, w, total, hh = 74) {
  const wrap = h('div', 'bar-wrap', parent); px(wrap, x, y, w, hh);
  const sc = w / total;
  for (let o = 4096; o < total; o += 4096) { const l = h('div', 'abs', wrap); css(l, { left: o * sc + 'px', top: '3px', width: '1px', height: hh - 6 + 'px', background: '#E4E8E0' }); }
  const api = {
    wrap, sc, x, y, hh,
    // 在 [a, b) 画一块；返回元素（初始可见）
    blk(a, b, kind, txt) {
      const e = h('div', 'blk', wrap); css(e, { left: a * sc + 3 + 'px', top: '6px', width: (b - a) * sc - 6 + 'px', height: hh - 12 + 'px', ...BLK[kind] });
      if (txt) { const t = h('div', 'abs', e, txt); css(t, { left: '10px', top: '50%', transform: 'translateY(-50%)', font: '600 22px "Mono"', color: kind === 'r' ? '#fff' : '#061621' }); }
      return e;
    },
    xOf(off) { return x + off * sc; },
  };
  return api;
}

// 字节格：BSON 47 字节排成一行（或多行）。返回 { all, name, type, val }
function byteRow(parent, x, y, perRow = 47, gap = 3) {
  const out = { all: [], name: [], type: [], val: [], len: [], end: [] };
  let i = 0;
  for (const [hex, k] of MDB.BSON) for (const b of hex.match(/../g)) {
    const e = h('div', 'byte', parent, b);
    px(e, x + (i % perRow) * (33 + gap), y + Math.floor(i / perRow) * 64);
    out.all.push(e); (out[k === 't' ? 'type' : k] || out.val).push(e); e._k = k; i++;
  }
  return out;
}

// 连线（SVG）：ov 由 overlay(world) 得到；直线或折线
function link(ov, pts, color = 'dim', o = {}) {
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return path(ov, d, color, { arrow: o.arrow === true, w: o.w || 2, dashed: o.dashed, opacity: o.opacity });
}

// 停留时的极慢横移（F05：一屏合计不超过 48 像素、每秒不超过 2 像素，一个方向）。返回段，供 cam.track 使用
function drift(t0, t1, x, dir = 1) { const d = Math.max(0.5, t1 - t0), dx = Math.min(48, 1.6 * d); return { from: x - dir * dx / 2, to: x + dir * dx / 2, d }; }

// 把一个元素换成「高亮」状态（class 切换，任意 seek 可复现）
const hl = (e, t0, t1, cls = 'on') => classAt(e, cls, t0, t1);

// 说明牌：标题加一行小字。返回元素，e._s 是小字那一行
function tile(parent, x, y, w, hh, title, sub = '', cls = '') {
  const e = h('div', 'tile ' + cls, parent); px(e, x, y, w, hh);
  h('div', 'tt', e, title); e._s = h('div', 'ts', e, sub);
  return e;
}
// 淡入淡出的强调（只改底色与边框，不闪）。o.c 同时改字色
function glow(e, t0, t1, o = {}) {
  const on = { backgroundColor: o.bg || '#C0FAE6', borderColor: o.bd || '#00684A', duration: 0.3 };
  const off = { backgroundColor: o.rb || '#FFFFFF', borderColor: o.rd || '#C1C7C6', duration: 0.3 };
  if (o.c) { on.color = o.c; off.color = o.rc || '#3D4F58'; }
  to(e, t0, on); if (t1 != null) to(e, t1, off);
}
// 一个数字随时间分段变化：steps = [[起点, 时长, 从, 到], …]；只看 t，任意 seek 可复现
function stepTo(e, steps, fmt = (v) => String(Math.round(v))) {
  let last = null;
  F((t) => {
    let v = steps[0][2];
    for (const [t0, d, a, b] of steps) if (t >= t0) v = lerp(a, b, ease.out5(clamp((t - t0) / d)));
    const s = fmt(v); if (s !== last) { e.textContent = s; last = s; }
  });
}
// 固定位置的一句旁注（深底白字）：t0 淡入，t1 淡出
function slotNote(parent, x, y, html, t0, t1, cls = '') {
  // 旁注落在这句的中段：句首由上一条旁注收走，句中再出这一条，一句里有两次变化
  const t = t1 != null ? t0 + Math.min(1.0, 0.25 * Math.max(0, t1 - t0)) : t0 + 0.4;
  const e = note(parent, x, y, html, 'dn ' + cls); show(e, t, { y: 8 }); if (t1 != null) hide(e, t1, { y: 0, d: 0.4 }); return e;
}
const fadeOut = (e, t, d = 0.45) => hide(e, t, { y: 0, d });

// 集合树 + 集合文件（第 06、07 章共用）：上面根页与四个叶页，下面文件带按 135168 字节（132 KB）排开，开始只露出前 98304 字节（96 KB）
const CV = { BX: 140, BY: 800, BW: 1640, TOTAL: 135168, CLIP0: 'inset(0 27.27% 0 0)', CLIP1: 'inset(0 0% 0 0)' };
function collView(world, t0, ov) {
  const { BX, BY, BW, TOTAL } = CV;
  const V = {};
  V.fileL = label(world, BX, BY - 50, 'collection-….wt', 'lab');
  V.sizeL = h('div', 'abs', world, '96 KB'); px(V.sizeL, BX + BW - 220, BY - 60);
  css(V.sizeL, { width: '220px', textAlign: 'right', font: '800 40px "Inter"', color: '#061621' });
  const B = V.band = fileBand(world, BX, BY, BW, TOTAL);
  css(B.wrap, { clipPath: CV.CLIP0 });
  V.b = { h: B.blk(0, 4096, 'h'), l1: B.blk(4096, 28672, 'l', '1–1224'), l2: B.blk(28672, 53248, 'l', '1225–2448'), l3: B.blk(53248, 65536, 'l', '2449–3123'), l4: B.blk(65536, 86016, 'l', '3124–4096'), r: B.blk(86016, 90112, 'r') };
  V.root = pg(world, 810, 130, 300, 70, '1 · 1225 · 2449 · 3124', 'root'); css(V.root, { fontSize: '22px' });
  V.leaf = ['1–1224', '1225–2448', '2449–3123', '3124–4096'].map((r, i) => pg(world, 260 + i * 390, 270, 340, 100, r));
  show([V.fileL, V.sizeL, B.wrap, V.root, ...V.leaf], t0, { y: 12 });
  if (ov) V.leaf.forEach((l, i) => { const p = link(ov, [[960, 200], [260 + i * 390 + 170, 270]], 'ink', { w: 2.4 }); draw(p, t0 + 0.4 + i * 0.08, 0.6); });
  return V;
}
// 叶页 i 到文件里 [a, b) 那一块的连线：dim 为淡色虚线，spring 为粗的亮绿线
function conn(ov, band, i, a, b, t0, color = 'dim') {
  const lx = 260 + i * 390 + 170, bx = band.xOf((a + b) / 2);
  const p = link(ov, [[lx, 370], [bx, CV.BY]], color, color === 'dim' ? { dashed: '6 6', w: 2 } : { w: 5 });
  if (color === 'dim') arrowIn(p, t0, 0.8); else draw(p, t0, 0.7);
  return p;
}
// 把文件带的可见范围从 from 变到 to（裁剪区），用显式起点保证任意 seek 可复现
function clipBand(band, t, d, from, to_, first = false) {
  tl.fromTo(band.wrap, { clipPath: from }, { clipPath: to_, duration: d, ease: 'power2.inOut', immediateRender: first }, t);
}

// 进场轻声：元素每次进场都很多，不逐个配声；每 2.5 秒最多一声，附近已有音效的就不再加（旁白之外的声音不抢话）
{
  const _show = show, seen = new Set();
  show = function (e, t, o = {}) {
    const k = Math.floor(t / 2.5);
    if (!seen.has(k) && !SFX.some((x) => Math.abs(x.t - t) < 0.5)) { seen.add(k); sfx('tick', t + 0.05, { g: 0.55 }); }
    return _show(e, t, o);
  };
}

// 实物回显：深色的 mongosh／终端卡（官网 mongosh 卡的样式）。内容全部抄自 research/lab/out_*.txt 的真实输出。
// cmd(t, html, prompt) 逐字打出一行命令；out(t, html) 整块出现一段回显；clear(t) 收起已有的行，给后面的让位。
function term(parent, x, y, w, hh, title, o = {}) {
  const c = h('div', 'card', parent); px(c, x, y, w, hh);
  h('div', 'bar', c, title);
  const fs = o.fs || 26, lh = o.lh || Math.round(fs * 1.46);
  const body = h('div', 'abs', c); css(body, { left: '26px', top: '70px', right: '26px', font: `400 ${fs}px/${lh}px "Mono", "Sans SC"`, whiteSpace: 'pre', color: '#E8EDEB' });
  const lines = [];
  const api = {
    c, body,
    cmd(t, html, prompt = 'lab&gt; ') {
      const e = h('div', '', body, ''); css(e, { minHeight: lh + 'px' });
      const plain = html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '_');
      typeText(e, `<span class="c">${prompt}</span>${html}`, t, 38, { cursorUntil: t + 0.25 + plain.length / 38, sfxGain: 0.4 });
      appear(e, t); lines.push(e); return e;
    },
    out(t, html, cls = '') { const e = h('div', cls, body, html); show(e, t, { y: 6, d: 0.35 }); lines.push(e); return e; },
    clear(t) { const ls = lines.splice(0); if (ls.length) to(ls, t, { autoAlpha: 0, duration: 0.3 }); ls.forEach((e) => set(e, t + 0.32, { display: 'none' })); },
  };
  return api;
}
