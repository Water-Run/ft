// 本片的部件：「像一页 sqlite.org 文档」（src/design/docpage.js 是静态样张，这里是能动的版本）。
// 白纸、黑色正文、深青标题与链接、语法铁路图的黑细线白框；强调只用文档的悬停麦色与已访问链接的紫褐；平涂，不用阴影、渐变、模糊。
// 所有时刻由 T()/Tend() 推出；元素的显隐一条链接到底：一个元素只登记一次入场、一次退场（docs/reference/pitfalls.md「页面与场景」）。

// ── 时刻：按词的时刻提前 0.3 秒、句首提前 0.12 秒（画面略早于话音）；找不到句号时报警告并返回片尾，避免负时刻让整条时间线平移 ──
const _T0 = T;
T = function (id, word, shift = 0) {
  if (!L.cues[id]) { console.warn('no cue', id); return L.total; }
  return Math.max(0, _T0(id, word, 0) - (word ? 0.3 : 0.12)) + shift;
};
// Tend 在引擎里是常量（不能改写）；场景只对存在的句号用它

const K = { ink: '#000000', body: '#1a1a1a', teal: '#044a64', blue: '#0482c4', visited: '#734559', wheat: '#f5deb3', code: '#eeeeee', codeLine: '#80a796', rule: '#444444', grey: '#dddddd', greyLine: '#aaaaaa', group: '#c8c8c8', dim: '#666666', red: '#aa3333', paper: '#ffffff' };

// 收走：写定起点（跳播时起点一致）。只对一个元素调用一次；已经收起或压暗的元素不要再交给它
function gone(e, t, d = 0.3) { tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: d, immediateRender: false }, t); }
// 从压暗的状态收走：起点写成当时的不透明度（用 gone 会先闪回原样）
function goneFrom(e, t, a, d = 0.3) { tl.fromTo(e, { autoAlpha: a }, { autoAlpha: 0, duration: d, immediateRender: false }, t); }
// 压暗与恢复：写明起止值
function dim(e, t, a = 0.25, from = 1, d = 0.3) { tl.fromTo(e, { opacity: from }, { opacity: a, duration: d, immediateRender: false }, t); }

// ── 文字 ──
function tx(p, html, x, y, o = {}) {
  const e = h('div', 'abs ' + (o.cls || ''), p, html); px(e, x, y, o.w);
  css(e, { fontSize: Math.max(24, o.fs || 32) + 'px', color: o.color || K.body, fontWeight: o.fw || 400, whiteSpace: o.wrap ? 'normal' : 'nowrap', lineHeight: o.lh || 1.4, ...(o.css || {}) });
  if (o.mono) e.style.fontFamily = '"Mono", "Sans SC"';
  if (o.center) { e.style.textAlign = 'center'; e.style.transform = 'translateX(-50%)'; }
  return e;
}
const lnk = (s) => `<span class="lnk">${s}</span>`;              // 文档的链接：深青带下划线
// 页标题：居中、深青、常规字重（文档的页标题）
// 页标题写这一段的要点（像前几集的页标题），放在镜头之外的固定层：镜头推拉时标题不动、不被放大
function pageTitle(p, s, y = 180, fs = 48) { const w = p.closest && p.closest('.world'); const host = w ? w.parentNode : p; const e = tx(host, s, 0, y - 18, { fs, color: K.teal, w: 1920, css: { textAlign: 'center', background: '#ffffff', height: '86px', lineHeight: '86px' } }); e.dataset.name = '页标题'; return e; }   // 白底一条：镜头推移时，内容从标题下面经过，不压字
// 小节标题：带编号、左对齐、深青
function h2(p, s, x, y, fs = 40) { return tx(p, s, x, y, { fs, color: K.teal }); }
// 注解框：文档的侧栏盒（2px 深青边），粗体名加一句话；data-gloss 供扫描核对术语的注解
function gloss(p, term, html, x, y, w = 560, o = {}) {
  const e = h('div', 'abs gloss', p, `<b>${term}</b>　${html}`); px(e, x, y, w); e.dataset.gloss = o.terms || term; e.dataset.beat = 'fill'; return e;
}
// 代码块：#eee 底、1px 灰绿边、等宽字
function codeBlock(p, lines, x, y, o = {}) {
  const e = h('div', 'abs codeblock', p, lines.map((l) => `<div>${l}</div>`).join('')); px(e, x, y, o.w);
  css(e, { fontSize: (o.fs || 28) + 'px' }); return e;
}
// 灰色小按钮（文档的 .button）
function btn(p, s, x, y, fs = 24) { fs = Math.max(24, fs); const e = h('div', 'abs btn', p, s); px(e, x, y); e.style.fontSize = fs + 'px'; return e; }
// 红色斜体出错框（文档里待办提示的样式）：出错、强行终止
function errBox(p, s, x, y, fs = 28) { fs = Math.max(24, fs); const e = h('div', 'abs err', p, s); px(e, x, y); e.style.fontSize = fs + 'px'; return e; }
// 文档表格：表头左对齐、下面一条 1px #444
function docTable(p, cols, rows, x, y, o = {}) {
  const t = h('div', 'abs dtable', p); px(t, x, y);
  const fs = Math.max(24, o.fs || 28); t.style.fontSize = fs + 'px';
  const hr = h('div', 'dtr dth', t); cols.forEach(([s, w]) => { const c = h('div', 'dtc', hr, s); c.style.width = w + 'px'; });
  const rs = rows.map((r) => { const rr = h('div', 'dtr', t); r.forEach((s, j) => { const c = h('div', 'dtc', rr, s); c.style.width = cols[j][1] + 'px'; }); return rr; });
  return { t, rs, hr };
}

// ── 页：全片唯一的基本图形。一页一格，白底黑细线；读到的页是麦色，读过的页描紫褐边 ──
function pageCell(p, x, y, w, hh, o = {}) {
  const e = h('div', 'abs pg', p); px(e, x, y, w, hh);
  if (o.fill) e.style.background = o.fill;
  if (o.bw != null) e.style.borderWidth = o.bw + 'px';
  return e;
}
// 文件：按归属给每页上色（表白、姓名索引浅灰、年龄索引更浅），排成网格
const OWN = { u: '#ffffff', n: '#d9d9d9', a: '#eeeeee', s: '#cfcfcf', t: '#cfcfcf', o: '#f6f6f6' };
function fileGrid(p, x, y, cols, cell, gap) {
  const own = DATA.file.owner, cells = [];
  for (let i = 0; i < own.length; i++) cells.push(pageCell(p, x + (i % cols) * (cell + gap), y + Math.floor(i / cols) * (cell + gap), cell, cell, { fill: OWN[own[i]], bw: 0.8 }));
  const pos = (pg) => ({ x: x + ((pg - 1) % cols) * (cell + gap), y: y + Math.floor((pg - 1) / cols) * (cell + gap), w: cell });
  return { cells, pos, h: Math.ceil(own.length / cols) * (cell + gap) - gap };
}

// ── 线：SVG 叠加层。铁路图的画法：黑细线、实心箭头 ──
function line(ov, pts, o = {}) {
  const d = 'M' + pts.map((q) => q.join(',')).join(' L');
  return path(ov, d, o.color || 'ink', { w: o.w || 2, arrow: o.arrow !== false, dashed: o.dashed });
}
// 铁路图的框：圆头框（关键字）或方框
function rrBox(p, s, x, y, o = {}) {
  const e = h('div', 'abs rr' + (o.round === false ? ' sq' : ''), p, s); px(e, x, y, o.w);
  if (o.fs) e.style.fontSize = Math.max(24, o.fs) + 'px';
  if (o.mono) e.style.fontFamily = '"Mono", "Sans SC"';
  return e;
}

// 镜头取景：每一段把这一段要看的元素放大到填满内容区（页标题之下、字幕之上），换段时镜头推过去。
// 元素按构建时的版面位置量（不含补间位移）；o.rect 直接给世界坐标的范围 [x0, y0, x1, y1]；o.zmax 最大倍数（缺省 1.5）；o.pad 四周留白（像素）
const VIEW = { x0: 80, x1: 1840, y0: 268, y1: 930 };
function viewOf(els, world, o = {}) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const e of [].concat(els || []).flat()) { if (!e) continue; const b = box(e, world); if (!b.w && !b.h) continue; x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.r); y1 = Math.max(y1, b.b); }
  if (o.rect) [x0, y0, x1, y1] = o.rect;
  const pad = o.pad != null ? o.pad : 30; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  const z = Math.max(o.zmin || 0.75, Math.min(o.zmax || 1.5, (VIEW.x1 - VIEW.x0) / (x1 - x0), (VIEW.y1 - VIEW.y0) / (y1 - y0)));
  return { x: (x0 + x1) / 2 - ((VIEW.x0 + VIEW.x1) / 2 - 960) / z, y: (y0 + y1) / 2 - ((VIEW.y0 + VIEW.y1) / 2 - 540) / z, z, r: 0 };
}
// keys: [[t, 元素或元素数组, o], …]：第一段在场景开始时就位（藏在章节卡后面），之后每段在 t 推过去（o.d 秒，缺省 1.2）
// 每段停留时照场景指南第 3 节，只朝一个方向极慢横移（屏幕上每秒 1.5 像素、一段至多 30 像素），不缩放
function shots(cam, world, s, keys) {
  const vs = keys.map(([t, els, o = {}]) => [t, viewOf(els, world, o), o]);
  const out = [];
  vs.forEach(([t, v, o], i) => {
    const d = i ? (o.d || 1.2) : 0, arrive = (i ? t : s.start) + d;
    if (i) out.push([t, v, d, { g: o.g != null ? o.g : 0.3, sfx: o.sfx }]);
    const next = i + 1 < vs.length ? vs[i + 1][0] : s.end, dur = next - arrive - 0.05;
    if (dur > 1) out.push([arrive, { x: v.x + Math.min(30, dur * 1.5) / v.z }, dur, { ease: 'none', sfx: false }]);
  });
  cam.track(s.start, vs[0][1], out);
}

// 区域：垫在内容底下的一块（选中时浅青底、深青外框），用来指「现在讲的是这一片」；默认看不见
function zone(p, x, y, w, hh) { const z = h('div', 'abs', p); px(z, x, y, w, hh); p.insertBefore(z, p.firstChild); z.dataset.beat = 'fill'; z.dataset.name = '区域'; return z; }

// 停在一屏上：只朝一个方向极慢横移（每秒不超过 2 像素，一屏合计不超过 40 像素），不缩放
function stay(cam, s, c0, dir = 1) {
  const dur = Math.max(1, s.end - c0 - 0.3), dx = dir * Math.min(40, dur * 1.5);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[c0 + 0.1, { x: 960 + dx }, dur, { ease: 'none', sfx: false }]]);
}

// ── 「当前在讲谁」：一句话开始时，它讲的那个对象换成文档主菜单的选中样式（深青底、白字），讲到下一个对象时选中移过去。
// list = [[时刻, 元素], …]，按时刻排好；每个选中持续到下一项开始（最后一项到 end 为止）。原来的底色、字色在构建时取实际值写进行内样式，
// 倒着跳时写回的就是同一个值（不靠 GSAP 第一次播到时去读继承来的颜色，那样会让顺播与跳播不一致）。
function beats(list, end) {
  // 「当前在讲谁」：每句讲到的对象挂上选中样式，讲到下一个就移过去。样式写在 style.css 的 .bt/.bf/.bl（!important），
  // 用 class 而不用 set：盖住元素自己被 set 过的底色、字色，移走后原来的值原样露出来。
  // 单个文字（含 span、b 的一行）用 .bt：深青底白字，向外扩 6px；含子 div 的框（或标了 data-beat="fill" 的）用 .bf：浅青底加深青外框；
  // 标了 data-beat="line" 的只描外框。一条可以是一组元素；连着讲同一个就一直亮着。
  const all = list.map(([t, e, keep]) => [t, (Array.isArray(e) ? e : [e]).filter(Boolean), keep]).filter(([t, g]) => g.length && isFinite(t)).sort((a, b) => a[0] - b[0]);
  const MIN = 1.0, items = [];
  for (const it of all) if (!items.length || it[2] || it[0] - items[items.length - 1][0] >= MIN) items.push(it);   // 第三项为真的「必留」，不受最短停留的约束
  const spans = new Map();
  items.forEach(([t, g], i) => {
    const t2 = Math.max(t + 0.3, i + 1 < items.length ? items[i + 1][0] : end);
    for (const e of g) {
      if (!spans.has(e)) spans.set(e, []);
      const a = spans.get(e), last = a[a.length - 1];
      if (last && last[1] >= t - 1e-6) last[1] = Math.max(last[1], t2); else a.push([t, t2]);
    }
  });
  for (const [e, a] of spans) {
    const cls = { text: 'bt', fill: 'bf', line: 'bl' }[e.dataset.beat || (e.querySelector('div') ? 'fill' : 'text')];
    F((t) => { const on = a.some(([t0, t1]) => t >= t0 && t < t1); if (e.classList.contains(cls) !== on) e.classList.toggle(cls, on); });   // 不缓存上一帧：keyed 换内容时会重写 class，每帧都按 t 对一遍
  }
}
