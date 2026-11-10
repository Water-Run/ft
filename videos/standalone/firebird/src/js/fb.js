// 本片的部件：一页手册（面包屑、编号标题、细线）、页里一层带透视的纸面、镜头、Logo 卡片与图注。
// 运动只有三种来路：跟着旁白入场（从它逻辑上来的方向）、换段时整页往上滚（顺着读文档的方向）、镜头只为强调推近。不做踩拍的来回错动。
const init = (e, v) => gsap.set(e, v);   // 初始状态在构建时直接设好（时间线上 t=0 的 set 在第 0 帧不生效）
const BEAT = 60 / 118;
const SCROLL = 1150;

// 一页：返回 { pg, world, vh, pl }。pl 是带透视的纸面，所有内容放在它上面；场景用 makeCamera(world, 1620, vh) 建镜头
function fbPage(root, s, o = {}) {
  const pg = h('div', 'page', root);
  h('div', 'crumb', pg, '<u>Firebird 小传</u> → 小众的第三选择');
  if (s.chap) { h('div', 'dh', pg, `${s.chap[0]}. ${s.chap[1]}`); h('div', 'dr', pg); }
  const view = h('div', 'view', pg);
  if (!s.chap) view.classList.add('full');
  const world = h('div', 'world-p', view);
  const p = h('div', 'persp', world);
  css(p, { perspective: (o.persp || 2400) + 'px', perspectiveOrigin: o.origin || '50% 30%' });
  const pl = h('div', 'plane', p);
  init(pl, { rotationX: o.rx != null ? o.rx : 7, rotationY: o.ry != null ? o.ry : -4 });
  return { pg, world, vh: s.chap ? 782 : 898, pl };
}
// 一段：纸面上的一组内容。换段时上一段往上滚走，下一段从下面滚上来
function fbSec(pl, first = false) {
  const g = h('div', 'sec', pl);
  if (!first) init(g, { y: SCROLL, autoAlpha: 0 });
  return g;
}
function fbScroll(a, b, t, d = 0.7) {
  to(a, t, { y: -SCROLL, duration: d, ease: 'power2.inOut' });
  set(a, t + d + 0.02, { autoAlpha: 0 });
  set(b, t - 0.01, { autoAlpha: 1 });
  to(b, t, { y: 0, duration: d, ease: 'power2.inOut' });
  sfx('whoosh', t, { g: 0.45, p: 0 });
}

// ───── 通用入场 / 退场 ─────
function fbIn(el, t, from = {}, o = {}) {
  init(el, { autoAlpha: 0, ...from });
  const end = { autoAlpha: 1 };
  for (const k of Object.keys(from)) if (typeof from[k] === 'number') end[k] = k === 'scale' || k === 'scaleX' || k === 'scaleY' ? 1 : 0;
  to(el, t, { ...end, ...(o.end || {}), duration: o.d || 0.36, ease: o.ease || 'power3.out' });
}
const fbOut = (el, t, end = {}) => to(el, t, { autoAlpha: 0, duration: 0.26, ease: 'power2.in', ...end });
// 落下：带一点弹跳，像放到纸面上
const fbDrop = (el, t, dy = -140, o = {}) => fbIn(el, t, { y: dy, ...(o.from || {}) }, { d: o.d || 0.5, ease: 'bounce.out' });
function fbAbs(parent, x, y, html, cls = '') {
  const e = h('div', ('abs ' + cls).trim(), parent, html);
  css(e, { left: x + 'px', top: y + 'px' });
  return e;
}
function fbCard(parent, x, y, w, hh, html, extra = {}) {
  const e = h('div', 'sheet', parent, html);
  css(e, { left: x + 'px', top: y + 'px', ...(w ? { width: w + 'px' } : {}), ...(hh ? { height: hh + 'px' } : {}), ...extra });
  return e;
}

// ───── Logo 卡片与图注 ─────
const LOGOS = {
  mysql: { src: '/img/logo-mysql.svg', ar: 0.681 },
  postgresql: { src: '/img/logo-postgresql.svg', ar: 1.031, name: 'PostgreSQL' },
  sqlite: { src: '/img/logo-sqlite.svg', ar: 0.473 },
  firefox: { src: '/img/logo-firefox.svg', ar: 1, name: 'Firefox' },
  firebird: { src: '/img/firebird-logo.png', ar: 1, name: 'Firebird' },
  dec: { src: '/img/logo-dec.svg', ar: 0.295 },
  borland: { src: '/img/logo-borland.svg', ar: 0.285 },
  ashton: { src: '/img/logo-ashton.svg', ar: 0.139 },
  mozilla: { src: '/img/logo-mozilla.svg', ar: 0.753, name: 'Mozilla' },
  sourceforge: { src: '/img/logo-sourceforge.svg', ar: 0.157 },
  windows: { src: '/img/logo-windows.svg', ar: 1, name: 'Windows' },
  linux: { src: '/img/logo-linux.svg', ar: 1.185, name: 'Linux' },
  macos: { src: '/img/logo-apple.svg', ar: 1.229, name: 'macOS' },
};
// 卡片：白纸上一枚 Logo，Logo 本身不带字的在下面补一行名字。w 为 Logo 宽度
function fbLogo(parent, x, y, key, w, o = {}) {
  const L_ = LOGOS[key], lh = Math.round(w * L_.ar), pad = o.pad != null ? o.pad : 30;
  const nm = o.name != null ? o.name : L_.name;
  const px_ = nm ? Math.max(pad, (nm.length * 23 + 36 - w) / 2) : pad;   // 名字比 Logo 宽时，卡片左右放宽，名字不出边
  const card = fbCard(parent, x, y, w + px_ * 2, lh + pad * 2 + (nm ? 62 : 0), `<img src="${L_.src}" style="position:absolute;left:${px_}px;top:${pad}px;width:${w}px;height:${lh}px">${nm ? `<div class="logo-n" style="top:${lh + pad + 8}px">${nm}</div>` : ''}`, o.flat ? { boxShadow: 'none', background: 'transparent' } : {});
  return card;
}
// 图注：手册里插图下方的说明行，名字加粗，其后一句交代这是谁
function fbCap(parent, x, y, name, text, w = 520) {
  const e = fbAbs(parent, x, y, `<b>${name}</b>${text}`, 'figcap');
  css(e, { width: w + 'px' });
  return e;
}
const fbCapIn = (e, t) => { init(e, { autoAlpha: 0 }); wipe(e, t, { dir: 'l', d: 0.45 }); };

// ───── 日历小页：年在上、月在下 ─────
function fbMini(parent, x, y, top, big) {
  return fbAbs(parent, x, y, `<div class="rg"><i></i><i></i></div><div class="b">${top}</div><div class="m">${big}</div>`, 'mini');
}

// ───── 浏览器窗口：标签页的图标与标题可换 ─────
function fbBrowser(parent, x, y, w, hh) {
  const el = fbCard(parent, x, y, w, hh, '');
  css(el, { overflow: 'hidden' });
  h('div', 'br-bar', el);
  const tab = h('div', 'br-tab', el);
  for (let i = 0; i < 3; i++) css(h('div', 'br-dot', el), { left: 26 + i * 30 + 'px' });
  h('div', 'br-addr', el);
  const body = h('div', 'br-body', el);
  const swap = (list, cls) => {
    let prev = null;
    list.forEach(([html, t]) => {
      const e = h('div', cls, tab, html);
      init(e, { autoAlpha: 0 });
      to(e, t, { autoAlpha: 1, duration: 0.14 });
      if (prev) to(prev, t, { autoAlpha: 0, duration: 0.1 });
      prev = e;
    });
  };
  return { el, tab, body, titles: (l) => swap(l, 'br-t'), icons: (l) => swap(l, 'br-i') };
}
// 印着 Firebird 标志的数据库
const fbDbFire = (w = 220) => artDb(w, '<image href="/img/firebird-logo.png" x="38" y="82" width="124" height="124"/>');
const fbDbPlain = (w = 160, txt = '') => artDb(w, txt ? `<text x="100" y="150" text-anchor="middle" font-family="Open Sans" font-weight="800" font-size="34" fill="#1c1c1c">${txt}</text>` : '');
// 名字标签：一张写着名字的纸条
const fbTag = (txt, cls = '') => `<div class="tag ${cls}">${txt}</div>`;
// 盖章
function fbStamp(parent, x, y, txt, t, o = {}) {
  const e = fbAbs(parent, x, y, txt, 'stamp' + (o.small ? ' s' : ''));
  fbIn(e, t - 0.1, { scale: o.from || 2, rotationZ: (o.rz || -8) + 14 }, { d: 0.2, end: { rotationZ: o.rz || -8 }, ease: 'power4.out' });
  sfx('thud', t, { g: 0.8 });
  return e;
}
