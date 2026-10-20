// OpenCart 1.5 后台皮肤与图解层的共用部件。全部由 t 决定：不用 CSS 过渡 / 动画、定时器、Math.random、时间线回调。
// 坐标一律是父元素（通常是场景的 world）里的像素。部件只「建」元素；入场由场景按旁白登记（wipe / slide / slideDown / fadeIn …）。
// 用法示例见 scenes/s00_open.js，规则见 js/SCENE-GUIDE.md。
//
// ── 1.5 时代的动作（jQuery 时代 UI 的行为，时长取 jQuery 的 fast 0.2 / normal 0.4 / slow 0.6）──
//   slideDown(el, t, { d })              自上而下展开（.slideDown）。入场前不可见
//   slideUp(el, t, { d })                自下而上收起并隐藏（.slideUp）
//   fadeIn(el, t, { d })   fadeOut(el, t, { d })   线性淡入 / 淡出（.fadeIn / .fadeOut）
//   reloadFlash(parent, x, y, w, h, t, { d })      整页 / 区域刷新时的白色闪屏，返回遮罩元素
//   spinner(parent, x, y, t0, t1, { size })        loading.gif 式 8 辐条步进旋转，只在 [t0, t1) 可见
//   travel(el, legs, { ease })           让元素沿折线走：legs = [[t0, 时长, [[x,y], [x,y], …]], …]，(x,y) 为元素左上角。
//                                        同一个元素只调用一次 travel，多段写进同一个 legs（各段时间不重叠）
//   drawLine(pathEl, t, d)               SVG 线由 t 算出描线进度；开始前 display:none，不露圆点
//   hl(el, t0, t1)                       浅黄高亮（类名 hi）。同一元素只登记一次
//   press(btn, t)                        按钮按下 0.18 秒（类名 down）+ tick
//
// ── 1.5 后台皮肤 ──
//   adminFrame(parent, { x, y, w, h, menu, active, who, crumb }) → { el, menu: [span], setActive(i, t) }
//        钢蓝页头（OpenCart | ADMINISTRATION）+ 深灰菜单（当前项锈橙）+ 面包屑。内容区从 y+200 起
//   ocBox(parent, x, y, w, h, title, { icon, buttons: [[文字, 'blue'|'rust'|'gray'], …] }) → { el, hd, bd, btns: [el] }
//        icon: 'order' | 'user' | 'setting' | 'db' | 'code' | 'report' | 'case'
//   ocTable(parent, x, y, cols, rows, { rowH, headH, filter, alt }) → { el, head, filt, rows: [el], cell(r, c), mark(r, t0, t1, cls), addRow(cells, t), height }
//        cols = [{ label, w, align: 'l'|'r'|'c' }]；rows = [[单元格 html, …]]。mark 默认类名 'hi'（浅黄）；'mk' = 浅黄 + 锈橙左边（不要用 'cur'：base.css 的 .cur 是打字光标）
//   ocButton(parent, text, x, y, kind = 'blue'|'rust'|'gray') → el
//   ocNotice(parent, x, y, w, type = 'success'|'warning'|'attention', html) → el（未入场；用 slideDown / fadeIn）
//   ocTabs(parent, x, y, labels, active = 0) → { el, tabs: [span], select(i, t) }
//   ocInput(parent, x, y, w, html?) → el（输入框，可放占位文字）
//   shot(parent, x, y, w, h, src, { sx, sy, scale }) → el     真实截图裁切（图 2560×1600），配 stamp(...,'real')
//   cursor(parent, x, y) → el    经典箭头指针；移动用 travel，点击用 click(cur, t)
//   click(cur, t)                指针按下 0.15 秒 + tick
//
// ── 图解层 ──
//   zone(parent, kind = 'browser'|'server'|'db', x, y, w, h, label, sub) → { el, addr? }   browser 带地址栏 addr
//   token(parent, html, kind = 'req'|'res', x, y, label?) → el    请求令牌：去程锈橙、返回钢蓝；label 写「带着什么」
//   chip(parent, html, x, y, cls?) → el    区域里的小方块（文件、模块）。cls: 'dark'（压在深色区上）
//   codeBlock(parent, x, y, w, lines, { lang: 'php'|'sql'|'text', title, raw }) → { el, lines: [el], on(i, t0, t1), lineY(i), note(i, html, t, { dx, w }) }
//        lines 为纯文本（自动转义、上色）；raw:true 时按 HTML 原样放。on() 每行只登记一次。note() 返回注释元素，已登记入场
//   callout(parent, x, y, html, { to: [x, y], kind: 'req'|'res'|'hiy' }) → { el, line, show(t) }   带引线的说明标签
//   sessionFile(parent, x, y, w, name, lines) → { el, lines: [el] }   服务器上的会话文件框
//   stamp(parent, x, y, kind = 'demo'|'real'|'case', text?) → el     「示意」/「OpenCart 1.5.6.4 实际页面 · 演示数据」/「匿名案例」
//   caseStrip(parent, x, y, w) → el    匿名案例顶边条「匿名案例 · 源码结构示意」
//   ovl(parent, x, y, w, h) → svg      局部 SVG 画布（viewBox 与父坐标一致），用 svgLine 画线
//   svgLine(svgEl, d, color = 'req'|'res'|'ink'|'dim'|颜色, { w, dash, arrow }) → path

const OC = { req: '#C4561C', res: '#0F6193', ink: '#1d1d1d', dim: '#8E9AA6', title: '#003A88', hi: '#FFFFCB' };
const CL = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// ── 动作 ──
function slideDown(e, t, o = {}) {
  const d = o.d || 0.4;
  tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  tl.fromTo(e, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: 'sine.inOut', immediateRender: true }, t);
  return e;
}
function slideUp(e, t, o = {}) {
  const d = o.d || 0.4;
  tl.to(e, { clipPath: 'inset(0% 0% 100% 0%)', duration: d, ease: 'sine.inOut' }, t);
  tl.set(e, { autoAlpha: 0 }, t + d);
}
function fadeIn(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: o.d || 0.4, ease: 'sine.inOut', immediateRender: true }, t); return e; }
function fadeOut(e, t, o = {}) { tl.to(e, { autoAlpha: 0, duration: o.d || 0.4, ease: 'sine.inOut' }, t); }

function reloadFlash(parent, x, y, w, hh, t0, o = {}) {
  const d = o.d || 0.45;
  const e = h('div', 'abs', parent); px(e, x, y, w, hh); css(e, { background: '#fff', opacity: 0, visibility: 'hidden' });
  e.dataset.overlapOk = '1'; e.setAttribute('data-overlap-ok', '');
  let last = -1;
  F((t) => {
    const k = (t - t0) / d;
    const a = k < 0 || k >= 1 ? 0 : (k < 0.25 ? k / 0.25 : 1 - (k - 0.25) / 0.75) * 0.92;
    const key = Math.round(a * 1000);
    if (key === last) return; last = key;
    e.style.opacity = a.toFixed(3); e.style.visibility = a > 0 ? 'visible' : 'hidden';
  });
  return e;
}

function spinner(parent, x, y, t0, t1, o = {}) {
  const s = o.size || 64;
  const e = h('div', 'oc-spin', parent); px(e, x, y, s, s); e.dataset.name = '读取中';
  const spokes = [];
  for (let i = 0; i < 8; i++) { const sp = h('i', '', e); sp.style.transform = `rotate(${i * 45}deg)`; spokes.push(sp); }
  let last = null;
  F((t) => {
    const on = t >= t0 && t < t1;
    const step = on ? Math.floor((t - t0) * 12) % 8 : -1;
    if (step === last) return; last = step;
    e.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    spokes.forEach((sp, i) => { const age = (step - i + 8) % 8; sp.style.opacity = (1 - age * 0.11).toFixed(2); });
  });
  return e;
}

function travel(e, legs, o = {}) {
  const ez = o.ease || ease.io3;
  const segs = legs.map(([t0, d, pts]) => {
    const lens = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
    return { t0, d, pts, lens, tot };
  });
  const at = (sg, k) => {
    let dist = k * sg.tot;
    for (let i = 0; i < sg.lens.length; i++) {
      if (dist <= sg.lens[i] || i === sg.lens.length - 1) { const q = sg.lens[i] ? clamp(dist / sg.lens[i]) : 1; return [lerp(sg.pts[i][0], sg.pts[i + 1][0], q), lerp(sg.pts[i][1], sg.pts[i + 1][1], q)]; }
      dist -= sg.lens[i];
    }
    return sg.pts[sg.pts.length - 1];
  };
  let lastKey = '';
  const apply = (t) => {
    let p = segs[0].pts[0];
    for (const sg of segs) { if (t < sg.t0) break; p = at(sg, ez(clamp((t - sg.t0) / sg.d))); }
    const key = Math.round(p[0]) + ',' + Math.round(p[1]);
    if (key === lastKey) return; lastKey = key;
    e.style.left = Math.round(p[0]) + 'px'; e.style.top = Math.round(p[1]) + 'px';
  };
  F(apply); apply(0);
  return e;
}

function drawLine(p, t0, d = 0.6) {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len + ' ' + len;
  let last = null;
  F((t) => {
    const k = clamp((t - t0) / d), e = ease.io3(k);
    const key = t < t0 ? -1 : Math.round(e * 1000);
    if (key === last) return; last = key;
    p.style.display = t < t0 ? 'none' : '';
    p.style.strokeDashoffset = (len * (1 - e)).toFixed(1);
  });
  return p;
}
const hl = (e, t0, t1) => classAt(e, 'hi', t0, t1);
function press(btn, t) { classAt(btn, 'down', t, t + 0.18); sfx('tick', t, { g: 0.7 }); }

// ── 图标（简化的 1.5 后台图标，SVG）──
function ocIcon(kind) {
  const I = {
    order: '<rect x="6" y="6" width="34" height="40" rx="3" fill="#E9C77B" stroke="#8A6A2A" stroke-width="2"/><rect x="11" y="12" width="24" height="30" fill="#fff" stroke="#9A9A9A"/><rect x="15" y="2" width="16" height="8" rx="2" fill="#9A9A9A"/><path d="M15 20h16M15 26h16M15 32h11" stroke="#7A7A7A" stroke-width="2"/>',
    user: '<circle cx="23" cy="15" r="9" fill="#6F95BF" stroke="#2F5A86" stroke-width="2"/><path d="M6 44c2-12 9-17 17-17s15 5 17 17z" fill="#6F95BF" stroke="#2F5A86" stroke-width="2"/>',
    setting: '<circle cx="23" cy="24" r="15" fill="#B9C2CB" stroke="#5B6670" stroke-width="2"/><circle cx="23" cy="24" r="6" fill="#fff" stroke="#5B6670" stroke-width="2"/><path d="M23 4v8M23 36v8M3 24h8M35 24h8" stroke="#5B6670" stroke-width="4"/>',
    db: '<ellipse cx="23" cy="10" rx="16" ry="6" fill="#7DA88E" stroke="#2F4A3A" stroke-width="2"/><path d="M7 10v28c0 3 7 6 16 6s16-3 16-6V10" fill="#5E8A71" stroke="#2F4A3A" stroke-width="2"/><path d="M7 22c0 3 7 6 16 6s16-3 16-6" fill="none" stroke="#2F4A3A" stroke-width="2"/>',
    code: '<rect x="4" y="6" width="38" height="36" rx="3" fill="#fff" stroke="#5B6670" stroke-width="2"/><path d="M16 17l-7 7 7 7M30 17l7 7-7 7" fill="none" stroke="#003A88" stroke-width="3"/>',
    report: '<rect x="6" y="4" width="34" height="42" rx="2" fill="#fff" stroke="#5B6670" stroke-width="2"/><rect x="12" y="28" width="5" height="12" fill="#C4561C"/><rect x="20" y="20" width="5" height="20" fill="#0F6193"/><rect x="28" y="14" width="5" height="26" fill="#5E8A71"/>',
    case: '<rect x="4" y="12" width="38" height="30" rx="3" fill="#8A5A36" stroke="#3B2414" stroke-width="2"/><rect x="16" y="5" width="14" height="9" rx="2" fill="none" stroke="#3B2414" stroke-width="3"/><path d="M4 24h38" stroke="#3B2414" stroke-width="2"/>',
  };
  return `<svg class="ico" viewBox="0 0 46 48">${I[kind] || I.order}</svg>`;
}

// ── 1.5 后台皮肤 ──
function adminFrame(parent, o = {}) {
  const x = o.x || 0, y = o.y || 0, w = o.w || 1920, hh = o.h || 1080;
  const menu = o.menu || ['控制台', '商品目录', '扩展功能', '销售', '系统', '报表', '帮助'];
  const el = h('div', 'oc-frame', parent); px(el, x, y, w, hh);
  const hdr = h('div', 'oc-hdr', el, '<div class="logo">OpenCart</div>');
  const sep = h('div', 'sep', hdr); sep.style.left = '292px';
  const adm = h('div', 'adm', hdr, 'ADMINISTRATION'); adm.style.left = '312px';
  if (o.who !== false) h('div', 'who', hdr, o.who || '已登录：演示管理员');
  const m = h('div', 'oc-menu', el, menu.map((c, i) => `<span class="${i === o.active ? 'on' : ''}">${c}</span>`).join(''));
  h('div', 'oc-shade', el);
  if (o.crumb) { const c = h('div', 'oc-crumb', el, o.crumb); px(c, 48, 196); }
  const spans = [...m.children];
  return {
    el, hdr, menuEl: m, menu: spans,
    setActive(i, t) { spans.forEach((s, j) => keyed(s).at(t, { cls: j === i ? 'on' : '' })); },
  };
}

function ocBox(parent, x, y, w, hh, title, o = {}) {
  const el = h('div', 'oc-box', parent); px(el, x, y, w, hh);
  const hd = h('div', 'hd', el, (o.icon !== false ? ocIcon(o.icon || 'order') : '') + `<span class="tt">${title}</span>`);
  if (o.icon === false) hd.style.paddingLeft = '26px';
  const btns = [];
  if (o.buttons) { const b = h('div', 'btns', hd); for (const [t, k] of o.buttons) btns.push(h('span', CL('oc-btn ' + (k && k !== 'blue' ? k : '')), b, t)); }
  const bd = h('div', 'bd', el);
  return { el, hd, bd, btns };
}

function ocButton(parent, text, x, y, kind = 'blue') {
  const e = h('div', CL('abs oc-btn ' + (kind !== 'blue' ? kind : '')), parent, text); px(e, x, y); return e;
}

function ocTable(parent, x, y, cols, rows, o = {}) {
  const rowH = o.rowH || 58, headH = o.headH || 62;
  const el = h('div', 'oc-table', parent); px(el, x, y);
  const mk = (cells, cls, hgt) => {
    const r = h('div', CL('tr ' + cls), el); r.style.height = hgt + 'px';
    cells.forEach((c, i) => { const col = cols[i] || {}; const td = h('div', CL('td ' + (col.align === 'r' ? 'r' : col.align === 'c' ? 'c' : '')), r, c == null ? '' : String(c)); td.style.width = col.w + 'px'; });
    return r;
  };
  const head = mk(cols.map((c) => c.label), 'th', headH);
  let filt = null;
  if (o.filter) filt = mk(cols.map((c) => (o.filter === true ? (c.filter === false ? '' : `<span class="oc-input" style="width:${Math.max(40, c.w - 40)}px"></span>`) : o.filter[cols.indexOf(c)] || '')), 'ft', 66);
  const rowEls = rows.map((r, i) => mk(r, o.alt && i % 2 ? 'alt' : '', rowH));
  const api = {
    el, head, filt, rows: rowEls,
    get height() { return el.offsetHeight; },
    cell: (r, c) => rowEls[r].children[c],
    mark: (r, t0, t1, cls = 'hi') => classAt(rowEls[r], cls, t0, t1),
    addRow(cells, t, oo = {}) { const r = mk(cells, oo.cls || '', rowH); rowEls.push(r); slideDown(r, t, { d: oo.d || 0.4 }); return r; },
  };
  return api;
}

function ocNotice(parent, x, y, w, type, html) {
  const ic = { success: '√', warning: '!', attention: 'i' }[type] || 'i';
  const e = h('div', 'oc-note ' + type, parent, `<span class="ic">${ic}</span>${html}`); px(e, x, y, w); return e;
}

function ocTabs(parent, x, y, labels, active = 0) {
  const el = h('div', 'oc-tabs', parent, labels.map((l, i) => `<span class="${i === active ? 'on' : ''}">${l}</span>`).join('')); px(el, x, y);
  const tabs = [...el.children];
  return { el, tabs, select(i, t) { tabs.forEach((s, j) => keyed(s).at(t, { cls: j === i ? 'on' : '' })); sfx('tick', t, { g: 0.6 }); } };
}
function ocInput(parent, x, y, w, html = '') {
  const e = h('div', 'abs oc-input', parent, html); px(e, x, y, w); css(e, { height: '52px', font: '500 28px/48px "Sans SC", "Inter"', padding: '0 12px', color: '#555' }); return e;
}

function shot(parent, x, y, w, hh, src, o = {}) {
  const el = h('div', 'oc-shot', parent); px(el, x, y, w, hh); el.dataset.name = '实际页面截图';
  const img = h('img', '', el); img.decoding = 'sync';
  const sc = o.scale || 1;
  css(img, { width: 2560 * sc + 'px', left: -(o.sx || 0) * sc + 'px', top: -(o.sy || 0) * sc + 'px' });
  window.PENDING = window.PENDING || [];
  window.PENDING.push(new Promise((res) => { img.onload = res; img.onerror = res; }));
  img.src = src;
  return el;
}

function cursor(parent, x, y) {
  const e = h('div', 'cursor', parent, '<svg viewBox="0 0 20 30" width="40" height="60"><path d="M1 1 L1 23 L6.5 18 L10.5 28 L14 26.5 L10 17 L17 17 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>');
  px(e, x, y); e.dataset.name = '鼠标指针'; e.setAttribute('data-overlap-ok', ''); return e;
}
function click(cur, t) {
  tl.fromTo(cur, { scale: 1 }, { scale: 0.84, duration: 0.07, ease: 'none', transformOrigin: '0 0', immediateRender: false }, t);
  tl.fromTo(cur, { scale: 0.84 }, { scale: 1, duration: 0.1, ease: 'none', transformOrigin: '0 0', immediateRender: false }, t + 0.07);
  sfx('tick', t);
}

// ── 图解层 ──
function zone(parent, kind, x, y, w, hh, label, sub) {
  const el = h('div', 'zone ' + kind, parent); px(el, x, y, w, hh); el.dataset.name = label;
  const out = { el };
  if (kind === 'browser') { h('div', 'bar', el); out.addr = h('div', 'addr', el, ''); }
  h('div', 'zl', el, label);
  if (sub) h('div', 'zs', el, sub);
  return out;
}
function token(parent, html, kind = 'req', x = 0, y = 0, label) {
  const e = h('div', 'token ' + kind, parent, html + (label ? `<span class="tl">${label}</span>` : '')); px(e, x, y); return e;
}
function chip(parent, html, x, y, cls = '') { const e = h('div', CL('chip ' + cls), parent, html); px(e, x, y); return e; }

function hiCode(s, lang) {
  let t = esc(s);
  if (lang === 'sql') {
    t = t.replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|LIMIT|UPDATE|SET|INSERT INTO|VALUES|COUNT|DESC|ASC|LEFT JOIN|ON|AS|IN|NOT|NULL)\b/g, '<span class="k">$1</span>');
    t = t.replace(/('[^']*')/g, '<span class="s">$1</span>');
  } else if (lang === 'php') {
    t = t.replace(/\b(function|return|if|else|foreach|as|new|class|public|private|extends|isset)\b/g, '<span class="k">$1</span>');
    t = t.replace(/(\$[a-zA-Z_]\w*)/g, '<span class="v">$1</span>');
    t = t.replace(/('[^']*')/g, '<span class="s">$1</span>');
    t = t.replace(/(\/\/.*)$/, '<span class="cm">$1</span>');
  }
  return t;
}
function codeBlock(parent, x, y, w, lines, o = {}) {
  const el = h('div', 'code', parent); px(el, x, y, w);
  const top = o.title ? 52 + 2 : 0;
  if (o.title) h('div', 'ct', el, o.title);
  const cb = h('div', 'cb', el);
  const ls = lines.map((l, i) => { const e = h('div', 'ln', cb, o.raw ? l : hiCode(l, o.lang)); e.dataset.n = String((o.start || 1) + i); return e; });
  const lineY = (i) => y + top + 14 + i * 52;
  return {
    el, lines: ls, lineY,
    on: (i, t0, t1) => classAt(ls[i], 'on', t0, t1),
    note(i, html, t, oo = {}) {
      const n = h('div', 'code-note', parent, html); px(n, x + w + (oo.dx != null ? oo.dx : 28), lineY(i) + 2);
      if (oo.w) css(n, { width: oo.w + 'px', whiteSpace: 'normal' });
      if (t != null) { slide(n, t, { x: -30, d: 0.4, ease: 'power2.out' }); sfx('pop', t, { g: 0.5 }); }
      return n;
    },
  };
}

function ovl(parent, x = 0, y = 0, w = 1920, hh = 1080) {
  const s = svg('svg', { class: 'ov', viewBox: `${x} ${y} ${w} ${hh}` }, parent);
  css(s, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' });
  s._seq = ++OV_SEQ;
  const defs = svg('defs', {}, s);
  for (const id in OC) {
    const m = svg('marker', { id: `oa${s._seq}-${id}`, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M0,0 L10,5 L0,10 Z', fill: OC[id] }, m);
  }
  return s;
}
function svgLine(s, d, color = 'req', o = {}) {
  const c = OC[color] || color;
  return svg('path', { d, fill: 'none', stroke: c, 'stroke-width': o.w || 4, 'stroke-linecap': 'butt', 'stroke-linejoin': 'round',
    ...(o.arrow === false || !OC[color] ? {} : { 'marker-end': `url(#oa${s._seq}-${color})` }), ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, s);
}

function callout(parent, x, y, html, o = {}) {
  const el = h('div', CL('callout ' + (o.kind || '')), parent, html); px(el, x, y);
  let line = null, s = null;
  if (o.to) {
    const b = box(el, parent), [tx, ty] = o.to;
    let sx, sy;
    if (ty > b.b) { sx = b.cx; sy = b.b; } else if (ty < b.y) { sx = b.cx; sy = b.y; } else if (tx > b.r) { sx = b.r; sy = b.cy; } else { sx = b.x; sy = b.cy; }
    const minx = Math.min(sx, tx) - 20, miny = Math.min(sy, ty) - 20;
    s = ovl(parent, minx, miny, Math.abs(tx - sx) + 40, Math.abs(ty - sy) + 40);
    const col = o.kind === 'res' ? 'res' : o.kind === 'req' ? 'req' : 'ink';
    line = svgLine(s, `M${sx},${sy} L${tx},${ty}`, col, { w: 3 });
    svg('circle', { cx: tx, cy: ty, r: 6, fill: OC[col] }, s);
  }
  return {
    el, line, svg: s,
    show(t) { slide(el, t, { y: 16, d: 0.35, ease: 'power2.out' }); if (line) { drawLine(line, t + 0.1, 0.35); appear(s, t + 0.1); } sfx('pop', t, { g: 0.5 }); },
  };
}

function sessionFile(parent, x, y, w, name, lines) {
  const el = h('div', 'sess', parent); px(el, x, y, w); el.dataset.name = '会话文件';
  h('div', 'sh', el, name);
  const sb = h('div', 'sb', el);
  const ls = lines.map((l) => h('div', '', sb, l));
  return { el, lines: ls };
}
function stamp(parent, x, y, kind = 'demo', text) {
  const def = { demo: '示意', real: 'OpenCart 1.5.6.4 实际页面 · 演示数据', case: '匿名案例' }[kind];
  const e = h('div', 'stamp ' + kind, parent, text || def); px(e, x, y); return e;
}
function caseStrip(parent, x, y, w) {
  const e = h('div', 'case-strip', parent, '<span>匿名案例 · 源码结构示意</span><span style="font-weight:500;opacity:.8">数据与编号均为独立合成</span>'); px(e, x, y, w); return e;
}
