// 本片的部件：文档页页顶、图注、提示框、代码块、页、文件带、字节格、连线。按本片视觉系统（MongoDB 文档页）写（经验规则 F21），只在这一集用。
// 数据全部取自 research/FACTS.md：A04（47 字节逐段）、B03（集合树的分界）、B04（叶页大小）、D04/F05/F07（检查点后块的位置）。

const MDB = {
  // Alice 的 47 字节（A04）：[十六进制, 含义] 含义：len 长度、t 类型、name 字段名、val 值、end 结尾
  BSON: [['2f000000', 'len'], ['07', 't'], ['5f696400', 'name'], ['6afa6ca26f27506cfb0a4e81', 'val'], ['02', 't'], ['6e616d6500', 'name'], ['06000000', 'val'], ['416c69636500', 'val'], ['10', 't'], ['61676500', 'name'], ['2a000000', 'val'], ['00', 'end']],
  // 集合文件里的块（字节偏移，B03 B04 D04 F05 F07）
  FILE0: [[0, 4096, 'h'], [4096, 28672, 'l', '1–1224'], [28672, 53248, 'a', '1225–2448'], [53248, 65536, 'l', '2449–3123'], [65536, 86016, 'l', '3124–4096'], [86016, 90112, 'r', '根']],
  CHAPS: [['01', 'NoSQL'], ['02', '一个集合，三棵树'], ['03', '增'], ['04', '落盘'], ['05', '查'], ['06', '改'], ['07', '删'], ['08', '事务与并发'], ['09', '出错怎么办'], ['10', '五个问题'], ['11', '不是 SQL']],
};

// 注解：画面上解释术语的那一块（scan.js 的 GLOSS 按 data-gloss 核对）
function gloss(e, term) { e.dataset.gloss = term; return e; }
function note(parent, x, y, html, cls = '') { const e = h('div', 'note ' + cls, parent, html); px(e, x, y); return e; }
function chip(parent, x, y, txt, cls = '') { const e = h('div', 'chip ' + cls, parent, txt); px(e, x, y); return e; }
function label(parent, x, y, txt, cls = 'lab') { const e = h('div', 'abs ' + cls, parent, txt); px(e, x, y); return e; }
function code(parent, x, y, txt) { const e = h('div', 'code', parent, txt); px(e, x, y); return e; }
const fadeOut = (e, t, d = 0.45) => hide(e, t, { y: 0, d });

// ── 文档页页顶：面包屑（最后一段是本章，再后一段随小节换）、版本选择框、细线。不随镜头动 ──
function chrome(root, s, chapName) {
  const c = h('div', 'chrome', root);
  h('div', 'hr', c);
  const cr = h('div', 'crumb', c, `<span>文档</span><i>/</i><span>数据库引擎</span><i>/</i><span>WiredTiger</span><i>/</i><b>${chapName}</b>`);
  h('div', 'ver', c, 'MongoDB 9.0 <span class="k2">（当前）</span>');
  let cur = null;
  const api = {
    c,
    // 小节：面包屑末尾多一段，旧的淡出、新的淡入（文档页「在此页面上」的位置感）
    sec(t, txt) {
      const e = h('span', '', cr, `<i style="margin-right:14px">›</i>${txt}`);
      css(e, { color: '#00684A', fontWeight: 600, position: 'absolute', left: '100%', marginLeft: '14px', whiteSpace: 'nowrap' });
      if (cur) hide(cur, t, { y: 0, x: -10, d: 0.3 });
      show(e, t + 0.15, { y: 0, x: 14, d: 0.4 });
      cur = e; return e;
    },
  };
  return api;
}

// ── 图注：一幅主图下面一行（图号、说明、出处）。list = [[t, 图号, 说明, 出处], …]，到下一项时原地换 ──
function figs(parent, x, y, w, list, tEnd) {
  const out = [];
  list.forEach(([t, no, txt, src], i) => {
    const e = h('div', 'fig', parent, `<b>${no}</b>${txt}${src ? `<span class="src">${src}</span>` : ''}`); px(e, x, y, w);
    show(e, t, { y: 8, d: 0.45 });
    const nx = list[i + 1] ? list[i + 1][0] : tEnd;
    if (nx != null) hide(e, nx - 0.05, { y: 0, d: 0.3 });
    out.push(e);
  });
  return out;
}

// ── 提示框：note 注意、tip 提示、imp 重要、warn 警告（LeafyGreen Callout 的四色） ──
const ICON = {
  note: '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="#1254B7" stroke-width="2.6"/><path d="M14 12.5v7" stroke="#1254B7" stroke-width="2.8" stroke-linecap="round"/><circle cx="14" cy="8.6" r="1.8" fill="#1254B7"/></svg>',
  tip: '<svg viewBox="0 0 28 28"><path d="M9.5 16.5a7 7 0 1 1 9 0c-1 .9-1.5 1.8-1.5 3h-6c0-1.2-.5-2.1-1.5-3z" fill="none" stroke="#00684A" stroke-width="2.4" stroke-linejoin="round"/><path d="M11 23h6" stroke="#00684A" stroke-width="2.4" stroke-linecap="round"/></svg>',
  imp: '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="#944F01" stroke-width="2.6"/><path d="M14 8v7.5" stroke="#944F01" stroke-width="2.8" stroke-linecap="round"/><circle cx="14" cy="19.6" r="1.8" fill="#944F01"/></svg>',
  warn: '<svg viewBox="0 0 28 28"><path d="M14 4 25 23H3z" fill="none" stroke="#970606" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 11v6" stroke="#970606" stroke-width="2.8" stroke-linecap="round"/><circle cx="14" cy="20" r="1.6" fill="#970606"/></svg>',
};
const CT = { note: '注意', tip: '提示', imp: '重要', warn: '警告' };
function callout(parent, x, y, kind, body, title) {
  const e = h('div', 'callout ' + kind, parent, `<div class="ct">${ICON[kind]}${title || CT[kind]}</div><div>${body}</div>`);
  px(e, x, y); return e;
}

// ── 代码块（文档页样式）：返回 { c, body, line(html) } ──
function codeCard(parent, x, y, w, title, hh) {
  const c = h('div', 'card', parent); px(c, x, y, w, hh);
  h('div', 'bar', c, `<span class="lang">${title}</span><span class="copy"></span>`);
  const body = h('div', 'body', c);
  return { c, body, line(html) { return h('div', '', body, html); } };
}

// 页
function pg(parent, x, y, w, hh, txt = '', cls = '') { const e = h('div', 'pg ' + cls, parent, txt); px(e, x, y, w, hh); return e; }

// 文件带：按真实偏移排开，4 KB 一格。kind：h 文件头、l 叶页、a 正在讲的叶页、r 根页、f 空出、d Dave 那一页
const BLK = {
  h: { background: '#C1C7C6' }, l: { background: '#FFFFFF', border: '1.5px solid #889397' }, a: { background: '#00ED64' },
  r: { background: '#001E2B' }, f: { background: 'transparent', border: '2.5px dashed #5C6C75' }, d: { background: '#71F6BA' }, o: { background: '#E3FCF7', border: '1.5px solid #00A35C' },
};
function fileBand(parent, x, y, w, total, hh = 74) {
  const wrap = h('div', 'bar-wrap', parent); px(wrap, x, y, w, hh);
  const sc = w / total;
  for (let o = 4096; o < total; o += 4096) { const l = h('div', 'abs', wrap); css(l, { left: o * sc + 'px', top: '3px', width: '1px', height: hh - 6 + 'px', background: '#E8EDEB' }); }
  const api = {
    wrap, sc, x, y, hh,
    blk(a, b, kind, txt) {
      const e = h('div', 'blk', wrap); css(e, { left: a * sc + 3 + 'px', top: '6px', width: (b - a) * sc - 6 + 'px', height: hh - 12 + 'px', ...BLK[kind] });
      if (txt) { const t = h('div', 'abs', e, txt); css(t, { left: '10px', top: '50%', transform: 'translateY(-50%)', font: '600 22px "Mono"', color: kind === 'r' ? '#fff' : '#001E2B' }); }
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
function drift(t0, t1, x, dir = 1) { const d = Math.max(0.5, t1 - t0), dx = Math.min(40, 1.4 * d); return { from: x - dir * dx / 2, to: x + dir * dx / 2, d }; }

// 把一个元素换成「高亮」状态（class 切换，任意 seek 可复现）
const hl = (e, t0, t1, cls = 'on') => classAt(e, cls, t0, t1);

// 说明牌：标题加一行小字。返回元素，e._s 是小字那一行
function tile(parent, x, y, w, hh, title, sub = '', cls = '') {
  const e = h('div', 'tile ' + cls, parent); px(e, x, y, w, hh);
  e._t = h('div', 'tt', e, title); e._s = h('div', 'ts', e, sub);
  return e;
}
// 淡入淡出的强调（只改底色与边框，不闪）。o.c 同时改字色
function glow(e, t0, t1, o = {}) {
  const on = { backgroundColor: o.bg || '#E3FCF7', borderColor: o.bd || '#00A35C', duration: 0.35 };
  const off = { backgroundColor: o.rb || '#FFFFFF', borderColor: o.rd || '#C1C7C6', duration: 0.35 };
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
// 一个框（指认用）：淡入、淡出，不跳
function ring(parent, x, y, w, hh, t0, t1, color = '#00A35C') {
  const e = h('div', 'abs', parent); px(e, x, y, w, hh); css(e, { border: `4px solid ${color}`, borderRadius: '10px' });
  show(e, t0, { y: 0, s: 1.03, d: 0.35 }); if (t1 != null) hide(e, t1, { y: 0, d: 0.35 });
  return e;
}

// 集合树 + 集合文件（第 06、07 章共用）：上面根页与四个叶页，下面文件带按 135168 字节（132 KB）排开，开始只露出前 98304 字节（96 KB）
const CV = { BX: 140, BY: 470, BW: 1640, TOTAL: 135168, CLIP0: 'inset(0 27.27% 0 0)', CLIP1: 'inset(0 0% 0 0)', RY: 128, LY: 244, LH: 86 };
function collView(world, t0, ov) {
  const { BX, BY, BW, TOTAL, RY, LY, LH } = CV;
  const V = {};
  V.fileL = label(world, BX, BY - 46, 'collection-….wt', 'lab');
  V.sizeL = h('div', 'abs', world, '96 KB'); px(V.sizeL, BX + BW - 220, BY - 58);
  css(V.sizeL, { width: '220px', textAlign: 'right', font: '700 40px "Inter"', color: '#001E2B' });
  const B = V.band = fileBand(world, BX, BY, BW, TOTAL);
  css(B.wrap, { clipPath: CV.CLIP0 });
  V.b = { h: B.blk(0, 4096, 'h'), l1: B.blk(4096, 28672, 'l', '1–1224'), l2: B.blk(28672, 53248, 'l', '1225–2448'), l3: B.blk(53248, 65536, 'l', '2449–3123'), l4: B.blk(65536, 86016, 'l', '3124–4096'), r: B.blk(86016, 90112, 'r') };
  V.root = pg(world, 790, RY, 340, 68, '1 · 1225 · 2449 · 3124', 'root'); css(V.root, { fontSize: '23px' });
  V.leaf = ['1–1224', '1225–2448', '2449–3123', '3124–4096'].map((r, i) => pg(world, 260 + i * 390, LY, 340, LH, r));
  show([V.fileL, V.sizeL, B.wrap, V.root, ...V.leaf], t0, { y: 12 });
  if (ov) V.leaf.forEach((l, i) => { const p = link(ov, [[960, RY + 68], [260 + i * 390 + 170, LY]], 'ink', { w: 2.4 }); draw(p, t0 + 0.4 + i * 0.08, 0.6); });
  return V;
}
// 叶页 i 到文件里 [a, b) 那一块的连线：dim 为淡色虚线，spring 为粗的亮绿线
function conn(ov, band, i, a, b, t0, color = 'dim') {
  const lx = 260 + i * 390 + 170, bx = band.xOf((a + b) / 2);
  const p = link(ov, [[lx, CV.LY + CV.LH], [bx, CV.BY]], color, color === 'dim' ? { dashed: '6 6', w: 2 } : { w: 5 });
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
    if (!seen.has(k) && !SFX.some((x) => Math.abs(x.t - t) < 0.5)) { seen.add(k); sfx('tick', t + 0.05, { g: 0.5 }); }
    return _show(e, t, o);
  };
}

// 实物回显：文档页样式的代码块（mongosh 或 shell）。内容全部抄自 research/lab/out_*.txt 的真实输出。
// cmd(t, html, prompt) 逐字打出一行命令；out(t, html) 整块出现一段回显；clear(t) 收起已有的行，给后面的让位。
function term(parent, x, y, w, hh, title, o = {}) {
  const c = h('div', 'card', parent); px(c, x, y, w, hh);
  h('div', 'bar', c, `<span class="lang">${title}</span><span class="copy"></span>`);
  const fs = o.fs || 26, lh = o.lh || Math.round(fs * 1.5);
  const body = h('div', 'abs', c); css(body, { left: '26px', top: '76px', right: '26px', font: `400 ${fs}px/${lh}px "Mono", "Sans SC"`, whiteSpace: 'pre', color: '#001E2B' });
  const lines = [];
  const api = {
    c, body,
    cmd(t, html, prompt = 'lab&gt; ') {
      const e = h('div', '', body, ''); css(e, { minHeight: lh + 'px' });
      const plain = html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '_');
      typeText(e, `<span class="p">${prompt}</span>${html}`, t, 38, { cursorUntil: t + 0.25 + plain.length / 38, sfxGain: 0.4 });
      appear(e, t); lines.push(e); return e;
    },
    out(t, html, cls = '') { const e = h('div', cls, body, html); show(e, t, { y: 6, d: 0.35 }); lines.push(e); return e; },
    clear(t) { const ls = lines.splice(0); if (ls.length) to(ls, t, { autoAlpha: 0, duration: 0.3 }); ls.forEach((e) => set(e, t + 0.32, { display: 'none' })); },
  };
  return api;
}

// ── 系列的整屏 PART 卡（片名与结尾预告同一版式）：左栏是系列目录（像文档左栏，当前集为选中项），右边面包屑、PART 徽标、标题 ──
// cur：当前集（6 或 7）；o.from：选中条从哪一集滑过来（结尾从 6 滑到 7）；返回 { el, main, nav, sel, items }，内容由调用方往 main 里放
const PARTS = [['PART 1', 'MyISAM'], ['PART 2', 'InnoDB'], ['PART 3', 'PostgreSQL'], ['PART 4', 'SQLite'], ['PART 5', 'ClickHouse'], ['PART 6', 'MongoDB'], ['PART 7', 'Redis']];
function partCard(parent, cur, t0, o = {}) {
  const el = h('div', 'chapter', parent); css(el, { zIndex: 20 });
  const nav = h('div', 'nav', el);
  h('div', 'nk', nav, '数据库引擎 · 系列');
  const Y0 = 200, DY = 84, from = o.from || cur;
  const sel = h('div', 'sel', nav); css(sel, { top: Y0 + (from - 1) * DY + 'px', height: '74px' });
  const items = PARTS.map(([p, n], k) => {
    const it = h('div', 'it' + (k < cur - 1 ? ' done' : ''), nav, `<span style="width:150px">${p}</span>${n}`);
    css(it, { top: Y0 + k * DY + 'px', height: '74px', lineHeight: '74px' }); return it;
  });
  const main = h('div', 'main', el);
  appear(el, t0);
  if (from !== cur) fromTo(sel, t0 + 0.5, { y: 0 }, { y: (cur - from) * DY, duration: 0.9, ease: 'power3.inOut' });
  else fromTo(sel, t0 + 0.2, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' });
  classAt(items[cur - 1], 'now', t0 + (from !== cur ? 1.1 : 0.4));
  return { el, main, nav, sel, items };
}

// 文档页底部的「下一页」链接：章末的问题落在下一章的入口上
function nextPage(parent, x, y, chapNo, chapName, t) {
  const e = h('div', 'abs', parent); px(e, x, y, 520, 96);
  css(e, { background: '#fff', border: '1.5px solid #C1C7C6', borderRadius: '12px', textAlign: 'right', padding: '12px 26px' });
  e.innerHTML = `<div style="font:500 22px Inter,'Sans SC';color:#5C6C75">下一页</div><div style="font:600 30px Inter,'Sans SC';color:#1254B7">${chapNo} ${chapName}  →</div>`;
  show(e, t, { x: 30, y: 0 }); return e;
}
