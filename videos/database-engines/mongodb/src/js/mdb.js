// 本片的部件（第 4 轮重做）：MongoDB 文档页的浅色主题，做法参照本系列前几集——
// 每章一个大而满的主画面（真实的页、树、文件、字节），注解是贴着实物的一行短字，术语第一次出现时用左侧绿竖线的注解；
// 不用图号图注、不用提示框、不放复述字幕的药丸。镜头每页一个静止全景，只为强调而动。
// 数据全部取自 research/FACTS.md：A04（47 字节逐段）、B03（集合树的分界）、B04（叶页大小）、D04/F05/F07（检查点后块的位置）。

const MDB = {
  // Alice 的 47 字节（A04）：[十六进制, 含义] 含义：len 长度、t 类型、name 字段名、val 值、end 结尾
  BSON: [['2f000000', 'len'], ['07', 't'], ['5f696400', 'name'], ['6afa6ca26f27506cfb0a4e81', 'val'], ['02', 't'], ['6e616d6500', 'name'], ['06000000', 'val'], ['416c69636500', 'val'], ['10', 't'], ['61676500', 'name'], ['2a000000', 'val'], ['00', 'end']],
  CHAPS: [['01', 'NoSQL'], ['02', '一个集合，三棵树'], ['03', '增'], ['04', '落盘'], ['05', '查'], ['06', '改'], ['07', '事务与并发'], ['08', '出错怎么办'], ['09', '删'], ['10', '五个问题'], ['11', '不是 SQL']],
  // 同一批 4096 个用户（环境与版本）：年龄 18 + i % 63
  age: (i) => 18 + (i % 63),
};
const K = { ink: '#001E2B', forest: '#00684A', spring: '#00ED64', mint: '#E3FCF7', mint2: '#C0FAE6', g1: '#00A35C', gl1: '#C1C7C6', gl2: '#E8EDEB', gl3: '#F9FBFA', gd1: '#5C6C75', gd2: '#3D4F58', gb: '#889397', blue: '#016BF8', blued: '#1254B7', bluel: '#E1F7FF', red: '#DB3030', redd: '#970606', redl: '#FFEAE5', mag: '#CC3887', str: '#12824D', yel: '#FFC010', yeld: '#944F01', yell: '#FEF7DB' };

// ── 小工具 ──
function gloss(e, term) { e.dataset.gloss = term; return e; }
function label(parent, x, y, txt, cls = 'lab') { const e = h('div', 'abs ' + cls, parent, txt); px(e, x, y); return e; }
function chip(parent, x, y, txt, cls = '') { const e = h('div', 'chip ' + cls, parent, txt); px(e, x, y); return e; }
function code(parent, x, y, txt) { const e = h('div', 'code', parent, txt); px(e, x, y); return e; }
const fadeOut = (e, t, d = 0.5) => tl.to(e, { autoAlpha: 0, duration: d, ease: 'power2.inOut' }, t);
const fadeIn = (e, t, d = 0.5) => tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: d, ease: 'power2.inOut', immediateRender: true }, t);
// 同一处换一批内容：旧的淡出，新的随后淡入（不滑屏）
function xfade(outs, ins, t, o = {}) { if (outs && [].concat(outs).length) fadeOut(outs, t, o.d || 0.5); if (ins) show(ins, t + (o.gap != null ? o.gap : 0.3), { y: o.y != null ? o.y : 14, d: 0.6, stagger: o.stagger || 0 }); }

// ── 页顶：面包屑与版本选择框；章内另有一行本章的问题（整章不变，像文档页的 H1） ──
function chrome(root, s, chapName) {
  const c = h('div', 'chrome', root);
  h('div', 'hr', c);
  h('div', 'crumb', c, `<span>文档</span><i>/</i><span>数据库引擎</span><i>/</i><span>WiredTiger</span><i>/</i><b>${chapName}</b>`);
  h('div', 'ver', c, 'MongoDB 9.0 <span class="k2">（当前）</span>');
  if (s && s.chap) { css(c, { height: '178px' }); h('div', 'qt', c, s.chap[2]); }
  return { c, sec() {} };
}

// ── 术语注解：左边一条绿竖线，术语加一句定义；贴在它说明的东西旁边（scan.js 的 GLOSS 按 data-gloss 核对） ──
function gl(parent, x, y, term, def, o = {}) {
  const e = h('div', 'gl' + (o.cls ? ' ' + o.cls : ''), parent, `<b>${term}</b>${def ? `<span>${def}</span>` : ''}`);
  px(e, x, y); if (o.w) css(e, { width: o.w + 'px', whiteSpace: 'normal' });
  e.dataset.gloss = o.key || term; return e;
}
// 贴着实物的小标签；pts 给出时另画一条细引线（引线从标签指向实物）
function tg(parent, x, y, txt, cls = '') { const e = h('div', 'tg ' + cls, parent, txt); px(e, x, y); return e; }
function lead(ov, pts, o = {}) { return link(ov, pts, o.color || 'dim', { w: o.w || 2, dashed: o.dashed }); }

// ── 文档卡：mongosh 的写法。rows = [[字段, 值的 HTML], …]；返回 { c, r: {字段: 行}, v: {字段: 值} } ──
function docCard(parent, x, y, rows, o = {}) {
  const c = h('div', 'doc' + (o.cls ? ' ' + o.cls : ''), parent); px(c, x, y, o.w);
  if (o.fs) css(c, { fontSize: o.fs + 'px' });
  if (o.title) h('div', 'dt', c, o.title);
  h('div', 'br', c, '{');
  const r = {}, v = {};
  rows.forEach(([k, val], i) => {
    const line = h('div', 'dl', c, `<span class="k">${k}</span>: <span class="dv">${val}</span>${i < rows.length - 1 ? ',' : ''}`);
    r[k] = line; v[k] = line.querySelector('.dv');
  });
  h('div', 'br', c, '}');
  return { c, r, v };
}
const JS = (s) => `<span class="s">"${s}"</span>`, JN = (n) => `<span class="n">${n}</span>`, OID = (x = '6afa…4e81') => `ObjectId(<span class="s">'${x}'</span>)`;

// ── 页：带页头的长方块，里面一行行是键值项（一项一条细横格）。o.rows 给出要写字的项 [[行号, 文本]] ──
function pageBox(parent, x, y, w, hh, title, o = {}) {
  const c = h('div', 'pgx' + (o.cls ? ' ' + o.cls : ''), parent); px(c, x, y, w, hh);
  const head = h('div', 'ph', c, title || '');
  const body = h('div', 'pb', c);
  const n = o.n != null ? o.n : 8, rh = o.rh || 14, gap = o.gap || 7;
  const rows = [];
  for (let i = 0; i < n; i++) { const r = h('div', 'pr', body); css(r, { top: 10 + i * (rh + gap) + 'px', height: rh + 'px' }); rows.push(r); }
  return { c, head, body, rows };
}

// ── B 树：根页在上，叶页一排；根页到每个叶页一条线。cfg：x, y, w（叶页铺开的总宽）、root {w, h, txt}、leaves [{txt, n}]、lw、lh、dy ──
function treeView(parent, ov, cfg) {
  const L = cfg.leaves.length, lw = cfg.lw || 220, lh = cfg.lh || 150, dy = cfg.dy || 150;
  const rw = cfg.root.w || 300, rh = cfg.root.h || 64;
  const gapX = L > 1 ? (cfg.w - lw * L) / (L - 1) : 0;
  const cx = cfg.x + cfg.w / 2;
  const root = h('div', 'rootpg', parent, cfg.root.txt || ''); px(root, cx - rw / 2, cfg.y, rw, rh);
  if (cfg.root.fs) css(root, { fontSize: cfg.root.fs + 'px' });
  const ly = cfg.y + rh + dy;
  const leaves = cfg.leaves.map((lf, i) => {
    const p = pageBox(parent, cfg.x + i * (lw + gapX), ly, lw, lh, lf.txt, { n: lf.n != null ? lf.n : 5, rh: cfg.rh || 12, gap: cfg.rgap || 7 });
    return p;
  });
  const links = ov ? leaves.map((p, i) => link(ov, [[cx, cfg.y + rh], [cfg.x + i * (lw + gapX) + lw / 2, ly]], 'ink', { w: 2 })) : [];
  return { root, leaves, links, ly, lx: (i) => cfg.x + i * (lw + gapX), lw, lh, cx, rootY: cfg.y, rh, all: [root, ...leaves.map((p) => p.c)] };
}
// 一页往下写时的「影子」：同样大小的空页（几道格线），不带字
function ghostPage(world, x, y, w, hh, color = K.g1) {
  const e = h('div', 'abs', world); px(e, x, y, w, hh); css(e, { background: K.mint2, border: '3px solid ' + color, borderRadius: '8px', opacity: 0 });
  for (let k = 0; k < 5; k++) { const l = h('div', 'abs', e); css(l, { left: '12px', right: '12px', top: 18 + k * Math.max(14, (hh - 30) / 5) + 'px', height: '10px', borderRadius: '4px', background: color }); }
  return e;
}
// 树整体淡入：根页、叶页依次出现，连线随后描出
function showTree(T_, t, o = {}) {
  show(T_.root, t, { y: 10, d: 0.5 });
  T_.leaves.forEach((p, i) => show(p.c, t + 0.25 + i * (o.stagger != null ? o.stagger : 0.08), { y: 14, d: 0.5 }));
  T_.links.forEach((l, i) => draw(l, t + 0.35 + i * 0.06, 0.6));
}

// ── 文件带：按真实偏移排开，4 KB 一格。kind：h 文件头、l 叶页、a 正在讲的叶页、r 根页、f 空出、d Dave 那一页 ──
const BLK = {
  h: { background: K.gl1 }, l: { background: '#FFFFFF', border: '2px solid ' + K.gb }, a: { background: K.spring }, n: { background: K.mint2, border: '2px solid ' + K.g1 },
  r: { background: K.ink }, f: { background: 'transparent', border: '2.5px dashed ' + K.gd1 }, d: { background: '#71F6BA' },
};
function fileBand(parent, x, y, w, total, hh = 74) {
  const wrap = h('div', 'bar-wrap', parent); px(wrap, x, y, w, hh);
  const sc = w / total;
  for (let o = 4096; o < total; o += 4096) { const l = h('div', 'abs', wrap); css(l, { left: o * sc + 'px', top: '4px', width: '1.5px', height: hh - 8 + 'px', background: K.gl2 }); }
  const api = {
    wrap, sc, x, y, hh,
    blk(a, b, kind, txt) {
      const e = h('div', 'blk', wrap); css(e, { left: a * sc + 3 + 'px', top: '7px', width: (b - a) * sc - 6 + 'px', height: hh - 14 + 'px', ...BLK[kind] });
      if (txt) { const t = h('div', 'abs', e, txt); css(t, { left: '12px', top: '50%', transform: 'translateY(-50%)', font: '600 22px "Mono"', color: kind === 'r' ? '#fff' : K.ink }); e._t = t; }
      return e;
    },
    xOf(off) { return x + off * sc; },
    // 刻度：每隔 step 字节一个 KB 数（文件带下方）
    ticks(step, to_, cls = '') { const out = []; for (let o = 0; o <= to_; o += step) { const t = tg(parent, x + o * sc - 40, y + hh + 8, `${o / 1024} KB`, 'tick ' + cls); css(t, { width: '80px', textAlign: 'center' }); out.push(t); } return out; },
  };
  return api;
}
function clipBand(band, t, d, from, to_, first = false) { tl.fromTo(band.wrap, { clipPath: from }, { clipPath: to_, duration: d, ease: 'power2.inOut', immediateRender: first }, t); }

// 字节格：BSON 47 字节排成一行（或多行）。返回 { all, name, type, val, len, end }
function byteRow(parent, x, y, perRow = 47, gap = 3, bw = 33) {
  const out = { all: [], name: [], type: [], val: [], len: [], end: [] };
  let i = 0;
  for (const [hex, k] of MDB.BSON) for (const b of hex.match(/../g)) {
    const e = h('div', 'byte', parent, b);
    px(e, x + (i % perRow) * (bw + gap), y + Math.floor(i / perRow) * 64);
    if (bw !== 33) css(e, { width: bw + 'px' });
    out.all.push(e); (out[k === 't' ? 'type' : k] || out.val).push(e); e._k = k; i++;
  }
  return out;
}

// 连线（SVG）：ov 由 overlay(world) 得到；直线或折线
function link(ov, pts, color = 'dim', o = {}) {
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return path(ov, d, color, { arrow: o.arrow === true, w: o.w || 2, dashed: o.dashed, opacity: o.opacity });
}
// 一个元素换成「高亮」状态（class 切换，任意 seek 可复现）
const hl = (e, t0, t1, cls = 'on') => classAt(e, cls, t0, t1);
// 淡入淡出的强调（只改底色与边框，不闪）。o.c 同时改字色
function glow(e, t0, t1, o = {}) {
  const on = { backgroundColor: o.bg || K.mint, borderColor: o.bd || K.g1, duration: 0.4 };
  const off = { backgroundColor: o.rb || '#FFFFFF', borderColor: o.rd || K.gl1, duration: 0.4 };
  if (o.c) { on.color = o.c; off.color = o.rc || K.gd2; }
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
// 指认框：淡入、淡出，不跳
function ring(parent, x, y, w, hh, t0, t1, color = K.g1) {
  const e = h('div', 'abs', parent); px(e, x, y, w, hh); css(e, { border: `4px solid ${color}`, borderRadius: '10px' });
  e.setAttribute('data-name', 'ring');
  show(e, t0, { y: 0, s: 1.03, d: 0.4 }); if (t1 != null) fadeOut(e, t1, 0.4);
  return e;
}
// 实心结果块（第 4 轮 b）：一步的结果画成实心的块，贴在对象上，跟着旁白出现、停住，随这一段一起退。
// 颜色只按含义：new 新写入（深绿）、ink 结构（深色）、del 删除与丢失（红）、read 读者与日志（蓝）、warn 提醒（深黄）
const SOLID = { new: K.forest, ink: K.ink, del: K.red, read: K.blue, warn: K.yeld };
function res(parent, x, y, txt, kind, t, o = {}) {
  const e = h('div', 'abs', parent, txt); px(e, x, y);
  css(e, { background: SOLID[kind] || kind, color: '#FFFFFF', font: `700 ${o.fs || 30}px/${o.lh || 54}px "Inter", "Sans SC"`, padding: `0 ${o.pad || 20}px`, borderRadius: '10px', whiteSpace: 'nowrap' });
  e.dataset.name = 'res';
  if (t != null) show(e, t, { y: o.dy != null ? o.dy : 10, x: o.dx || 0, d: 0.4 });
  if (o.out != null) fadeOut(e, o.out, 0.4);
  return e;
}
// 对象本身换成实心状态色（字变白）；back = [时刻, 底色, 边色, 字色] 时退回
function solid(e, t, kind, back) {
  const c = SOLID[kind] || kind;
  to(e, t, { backgroundColor: c, borderColor: c, color: '#FFFFFF', duration: 0.35 });
  if (back) to(e, back[0], { backgroundColor: back[1], borderColor: back[2] || back[1], color: back[3] || K.ink, duration: 0.35 });
}
// 在 t 把一个元素的文字换掉：先淡出，换字，再淡入（不闪）
function swapFade(e, t, html, d = 0.25) {
  const prev = e.innerHTML;
  tl.to(e, { autoAlpha: 0, duration: d, ease: 'power2.in' }, t);
  swapAt(e, prev, html, t + d);
  tl.to(e, { autoAlpha: 1, duration: d + 0.1, ease: 'power2.out' }, t + d + 0.02);
}

// 一个元素的内容按时刻分段：steps = [[t0, html0], [t1, html1], …]，t0 之前用 html0。只看 t，同一元素只用这一个
function textAt(e, steps) { let last = null; F((t) => { let v = steps[0][1]; for (const [t0, x] of steps) if (t >= t0) v = x; if (v !== last) { e.innerHTML = v; last = v; } }); }

// ── 线条图标（平涂描线）。name：person server clock table plus cluster key graph doc kv bolt check lock cloud disk mem ──
const ICO = {
  person: '<circle cx="24" cy="15" r="9"/><path d="M7 43c1.5-10 8.5-15 17-15s15.5 5 17 15"/>',
  server: '<rect x="8" y="6" width="32" height="36" rx="4"/><path d="M8 18h32M8 30h32"/><circle cx="15" cy="12" r="1.8"/><circle cx="15" cy="24" r="1.8"/><circle cx="15" cy="36" r="1.8"/>',
  clock: '<circle cx="24" cy="24" r="17"/><path d="M24 13v11l7 5"/>',
  table: '<rect x="6" y="9" width="36" height="30" rx="3"/><path d="M6 19h36M6 29h36M18 9v30M30 9v30"/>',
  plus: '<path d="M24 10v28M10 24h28"/>',
  cluster: '<rect x="4" y="8" width="16" height="14" rx="2"/><rect x="28" y="8" width="16" height="14" rx="2"/><rect x="16" y="28" width="16" height="14" rx="2"/>',
  key: '<circle cx="15" cy="24" r="8"/><path d="M23 24h19M36 24v7M42 24v5"/>',
  graph: '<circle cx="12" cy="14" r="5"/><circle cx="36" cy="12" r="5"/><circle cx="24" cy="36" r="5"/><path d="M16 16l5 15M32 15l-6 16M17 13l14-1"/>',
  doc: '<path d="M12 6h17l9 9v27H12z"/><path d="M29 6v9h9M18 24h14M18 31h14"/>',
  kv: '<rect x="5" y="10" width="14" height="10" rx="2"/><rect x="5" y="28" width="14" height="10" rx="2"/><path d="M21 15h6M21 33h6"/><rect x="29" y="10" width="14" height="10" rx="2"/><rect x="29" y="28" width="14" height="10" rx="2"/>',
  bolt: '<path d="M27 4 11 27h12l-3 17 17-24H25z"/>',
  check: '<path d="M10 25l9 9 19-20"/>',
  lock: '<rect x="10" y="21" width="28" height="21" rx="3"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/>',
  disk: '<ellipse cx="24" cy="12" rx="16" ry="6"/><path d="M8 12v24c0 3.3 7.2 6 16 6s16-2.7 16-6V12"/><path d="M8 24c0 3.3 7.2 6 16 6s16-2.7 16-6"/>',
  mem: '<rect x="6" y="14" width="36" height="20" rx="2"/><path d="M12 34v6M20 34v6M28 34v6M36 34v6M12 8v6M20 8v6M28 8v6M36 8v6"/>',
  wide: '<path d="M6 12h36M6 24h28M6 36h36"/><circle cx="6" cy="12" r="2.5"/><circle cx="6" cy="24" r="2.5"/><circle cx="6" cy="36" r="2.5"/>',
  x: '<path d="M13 13l22 22M35 13 13 35"/>',
};
function ico(name, size = 48, color = K.ink, sw = 2.6) { return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICO[name]}</svg>`; }
function icon(parent, x, y, name, size = 48, color = K.ink, sw = 2.6) { const e = h('div', 'abs', parent, ico(name, size, color, sw)); px(e, x, y, size, size); return e; }
// 人物：图标加名字（名字在图标下面）
function person(parent, x, y, name, color = K.ink, size = 64) {
  const e = h('div', 'abs', parent); px(e, x, y, 160, size + 44);
  const i = h('div', 'abs', e, ico('person', size, color, 2.8)); css(i, { left: (160 - size) / 2 + 'px', top: 0 });
  const n = h('div', 'abs', e, name); css(n, { left: 0, top: size + 4 + 'px', width: '160px', textAlign: 'center', font: '700 28px "Inter", "Sans SC"', color });
  e._n = n; e._i = i; return e;
}

// 进场轻声：每 2.5 秒最多一声，附近已有音效的就不再加（旁白之外的声音不抢话）
{
  const _show = show, seen = new Set();
  show = function (e, t, o = {}) {
    const k = Math.floor(t / 2.5);
    if (!seen.has(k) && !SFX.some((x) => Math.abs(x.t - t) < 0.5)) { seen.add(k); sfx('tick', t + 0.05, { g: 0.45 }); }
    return _show(e, t, o);
  };
}

// 实物回显：文档页样式的代码块（mongosh 或 shell）。内容全部抄自 research/lab/out_*.txt 的真实输出。
// cmd(t, html, prompt) 逐字打出一行命令；out(t, html) 整块出现一段回显；clear(t) 收起已有的行。
function term(parent, x, y, w, hh, title, o = {}) {
  const c = h('div', 'card', parent); px(c, x, y, w, hh);
  h('div', 'bar', c, `<span class="lang">${title}</span><span class="copy"></span>`);
  const fs = o.fs || 26, lh = o.lh || Math.round(fs * 1.5);
  const body = h('div', 'abs', c); css(body, { left: '26px', top: '74px', right: '26px', font: `400 ${fs}px/${lh}px "Mono", "Sans SC"`, whiteSpace: 'pre', color: K.ink });
  const lines = [];
  const api = {
    c, body,
    cmd(t, html, prompt = 'lab&gt; ', cps = 38) {
      const e = h('div', '', body, ''); css(e, { minHeight: lh + 'px' });
      const plain = html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '_');
      typeText(e, `<span class="p">${prompt}</span>${html}`, t, cps, { cursorUntil: t + 0.25 + plain.length / cps, sfxGain: 0.4 });
      appear(e, t); lines.push(e); return e;
    },
    out(t, html, cls = '') { const e = h('div', cls, body, html); show(e, t, { y: 6, d: 0.4 }); lines.push(e); return e; },
    clear(t) { const ls = lines.splice(0); if (ls.length) to(ls, t, { autoAlpha: 0, duration: 0.35 }); ls.forEach((e) => set(e, t + 0.37, { display: 'none' })); },
  };
  return api;
}

// ── 系列的整屏 PART 卡（片名与结尾预告同一版式）：左栏是系列目录，左上是系列名；目录一项项递出，选中条一路落到本集 ──
// cur：当前集（6 或 7）；o.from：选中条从哪一集起（片名从 PART 1 一路落到 PART 6；结尾从 6 滑到 7）
const PARTS = [['PART 1', 'MyISAM'], ['PART 2', 'InnoDB'], ['PART 3', 'PostgreSQL'], ['PART 4', 'SQLite'], ['PART 5', 'ClickHouse'], ['PART 6', 'MongoDB'], ['PART 7', 'Redis']];
function partCard(parent, cur, t0, o = {}) {
  const el = h('div', 'chapter part', parent); css(el, { zIndex: 20 });
  const nav = h('div', 'nav', el);
  const nk = h('div', 'nk2', nav, '一个数据库引擎<br>是如何实现的？');
  const Y0 = 270, DY = 86, from = o.from || 1;
  const sel = h('div', 'sel', nav); css(sel, { top: Y0 + (from - 1) * DY + 'px', height: '76px' });
  const items = PARTS.map(([p, n], k) => {
    const it = h('div', 'it', nav, `<span style="width:150px">${p}</span>${n}`);
    css(it, { top: Y0 + k * DY + 'px', height: '76px', lineHeight: '76px' }); return it;
  });
  const main = h('div', 'main', el);
  // 进场：整屏淡入，左栏从左边滑进
  tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power2.inOut', immediateRender: true }, t0 - 0.15);
  tl.fromTo(nav, { x: -120 }, { x: 0, duration: 0.8, ease: 'power3.out', immediateRender: true }, t0 - 0.15);
  show(nk, t0 + 0.15, { y: 12, d: 0.5 });
  const step = o.step || 0.2, tItems = t0 + 0.35;
  if (o.cascade !== false) items.forEach((it, k) => show(it, tItems + k * step, { x: -24, y: 0, d: 0.45 }));
  // 选中条：先出现在 from，再一项项往下落到 cur（与目录递出同步）
  const tSel = o.cascade !== false ? tItems + 0.1 : t0 + 0.4;
  fromTo(sel, tSel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
  const tArrive = cur > from ? tSel + 0.35 + (cur - from) * step + 0.25 : tSel + 0.35;
  if (cur > from) fromTo(sel, tSel + 0.35, { y: 0 }, { y: (cur - from) * DY, duration: tArrive - tSel - 0.35, ease: 'power2.inOut' });
  items.forEach((it, k) => { if (k < cur - 1) classAt(it, 'done', tItems + k * step + 0.45); });
  classAt(items[cur - 1], 'now', tArrive - 0.1);
  return { el, main, nav, sel, items, tArrive };
}

// ── 第 06、07 章共用：上面内存里的集合树（根页 + 四个叶页，第二个叶页里写出 2049、2050、2051），右上角两个索引；
//    下面磁盘上的集合文件（按 135,168 字节排开，开始只露出前 98,304 字节），每个叶页一条虚线落到它在文件里的那一块。
//    块的位置：B03 B04（检查点后的初始布局，B10 各章相同）。返回各部件，供本章编排。
function collStage(world, ov, t0) {
  const V = {};
  V.mem = h('div', 'panel gray', world); px(V.mem, 120, 212, 1680, 380);
  V.mem.innerHTML = `<div style="position:absolute;left:22px;top:18px">${ico('mem', 40, K.gd2, 2.4)}</div><div style="position:absolute;left:76px;top:20px;font:700 30px 'Sans SC';color:${K.ink}">内存 · 缓存</div>`;
  V.dsk = h('div', 'panel gray', world); px(V.dsk, 120, 620, 1680, 320);
  V.dsk.innerHTML = `<div style="position:absolute;left:22px;top:266px">${ico('disk', 40, K.gd2, 2.4)}</div><div style="position:absolute;left:76px;top:268px;font:700 30px 'Sans SC';color:${K.ink}">磁盘 · <span style="font-family:Mono">collection-ccaa…41d.wt</span></div>`;
  V.ov = overlay(world);              // 连线层：在两块底板之上
  V.root = h('div', 'abs', world); px(V.root, 880, 236, 520, 70); css(V.root, { background: K.ink, borderRadius: '10px', color: '#fff', font: '600 26px/70px "Mono"', textAlign: 'center' });
  V.root.innerHTML = '根页 · 1 · 1225 · 2449 · 3124';
  V.LX = (i) => 170 + i * 395; V.LW = 345; V.LY = 360; V.LH = 200;
  const LV = ['1–1224', '1225–2448', '2449–3123', '3124–4096'];
  V.leaves = LV.map((r, i) => pageBox(world, V.LX(i), V.LY, V.LW, V.LH, '叶页 · ' + r, { n: i === 1 ? 0 : 6, rh: 14, gap: 11 }));
  V.links = V.leaves.map((p, i) => link(V.ov, [[1140, 306], [V.LX(i) + V.LW / 2, V.LY]], 'ink', { w: 2 }));
  // 第二个叶页：三项写出来
  V.rows = [['2049', 'User02049…'], ['2050', 'Alice · 42'], ['2051', 'User02051…']].map(([k, v], j) => {
    const e = h('div', 'abs', V.leaves[1].c); css(e, { left: '12px', right: '12px', top: 52 + j * 46 + 'px', height: '40px', borderRadius: '6px', font: '600 25px/40px "Mono"', color: K.gd2, paddingLeft: '10px', background: K.gl3 });
    e.innerHTML = `<b style="color:inherit">${k}</b>  ${v}`; return e;
  });
  // 两个索引（右上角的小框）
  V.ix = ['_id 索引', '姓名索引'].map((n, i) => { const e = h('div', 'abs', world); px(e, 1440 + i * 0, 228 + i * 56, 330, 48); css(e, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '8px', font: '700 24px/44px "Sans SC"', color: K.gd2, paddingLeft: '16px' }); e.innerHTML = n + '<span class="ok" style="margin-left:14px;color:inherit"></span>'; return e; });
  // 文件带
  V.TOTAL = 135168;
  V.band = fileBand(world, 170, 760, 1580, V.TOTAL, 92);
  V.size = h('div', 'abs', world, '96 KB'); px(V.size, 1450, 682, 300); css(V.size, { font: '800 52px "Inter"', color: K.ink, textAlign: 'right' });
  V.ticks = V.band.ticks(32768, 131072);
  V.b = {
    h: V.band.blk(0, 4096, 'h', '头'), l1: V.band.blk(4096, 28672, 'l', '1–1224'), l2: V.band.blk(28672, 53248, 'l', '1225–2448'),
    l3: V.band.blk(53248, 65536, 'l', '2449–3123'), l4: V.band.blk(65536, 86016, 'l', '3124–4096'), r: V.band.blk(86016, 90112, 'r'), x: V.band.blk(90112, 98304, 'h', '区段表'),
  };
  const BLK0 = [[4096, 28672], [28672, 53248], [53248, 65536], [65536, 86016]];
  V.drop = V.leaves.map((p, i) => link(V.ov, [[V.LX(i) + V.LW / 2, V.LY + V.LH], [V.band.xOf((BLK0[i][0] + BLK0[i][1]) / 2), 756]], 'dim', { w: 2, dashed: '6 6' }));
  css(V.band.wrap, { clipPath: 'inset(0 27.27% 0 0)' });
  // 进场
  show([V.mem, V.dsk], t0, { y: 14, d: 0.5 });
  show(V.root, t0 + 0.2, { y: 10, d: 0.45 });
  V.leaves.forEach((p, i) => show(p.c, t0 + 0.3 + i * 0.08, { y: 12, d: 0.45 }));
  V.links.forEach((p, i) => draw(p, t0 + 0.4 + i * 0.06, 0.5));
  show(V.ix, t0 + 0.5, { x: 16, y: 0, d: 0.45 });
  show([V.band.wrap, ...V.ticks], t0 + 0.4, { y: 10, d: 0.45 });
  show(V.size, t0 + 0.6, { y: 8, d: 0.45 });
  V.drop.forEach((p, i) => arrowIn(p, t0 + 0.7 + i * 0.06, 0.5));
  return V;
}
// 文件带在 t 露出到 a 字节处（显式起点，任意 seek 可复现）
function revealBand(V, t, fromB, toB, d = 0.8) { tl.fromTo(V.band.wrap, { clipPath: `inset(0 ${(1 - fromB / V.TOTAL) * 100}% 0 0)` }, { clipPath: `inset(0 ${(1 - toB / V.TOTAL) * 100}% 0 0)`, duration: d, ease: 'power2.inOut', immediateRender: false }, t); }
// 把一个块挪到新位置（只改 left/width，带文字）
function moveBlk(V, e, t, a, b, d = 0.7) { const sc = V.band.sc; to(e, t, { left: a * sc + 3, width: (b - a) * sc - 6, duration: d, ease: 'power2.inOut' }); }

// 描线：开始描之前整条隐藏（引擎的 draw() 用虚线偏移藏线，圆头线帽会在起点留下一个点）
draw = function (path, t, d = 0.9, o = {}) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = o.dash ? o.dash : len;
  if (o.dash) { tl.fromTo(path, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.6, immediateRender: true }, t); return; }
  tl.fromTo(path, { strokeDashoffset: len, autoAlpha: 0 }, { strokeDashoffset: 0, autoAlpha: 1, duration: d, ease: o.ease || 'power2.inOut', immediateRender: true }, t);
};
