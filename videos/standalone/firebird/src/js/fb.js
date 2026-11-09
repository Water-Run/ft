// 本片的小部件：一页手册、带透视的层、火焰色的立体字。
const init = (e, v) => gsap.set(e, v);   // 初始状态在构建时直接设好（时间线上 t=0 的 set 在第 0 帧不生效）
function fbExt(n, c1, c2, dx = 1, dy = 1) {
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = hex(c1), B = hex(c2), o = [];
  for (let i = 1; i <= n; i++) o.push(`${(i * dx).toFixed(1)}px ${(i * dy).toFixed(1)}px 0 rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * i / n)).join(',')})`);
  return o.join(',');
}
function fbPage(root, s, c0) {
  const pg = h('div', 'page', root);
  h('div', 'crumb', pg, '<u>Firebird 小传</u> → 小众的第三选择');
  if (s.chap) {
    const dh = h('div', 'dh', pg, `${s.chap[0]}. ${s.chap[1]}`);
    const dr = h('div', 'dr', pg);
    show(dh, c0 + 0.05, { x: -30, d: 0.45 });
    init(dr, { scaleX: 0 }); to(dr, c0 + 0.1, { scaleX: 1, duration: 0.5, ease: 'power3.out' });
    sfx('thud', c0 + 0.05, { g: 0.7 });
  }
  return pg;
}
function fbPlane(pg, rx, ry, rz = 0, persp = 1800, origin = '55% 32%') {
  const p = h('div', 'persp', pg);
  css(p, { perspective: persp + 'px', perspectiveOrigin: origin });
  const pl = h('div', 'plane', p);
  init(pl, { rotationX: rx, rotationY: ry, rotationZ: rz });
  pl.dataset.rx = rx; pl.dataset.ry = ry;
  return pl;
}
// 踩拍的错动：整层纸快速偏一下再回来，前后层之间产生视差。相邻两次至少隔 0.5 秒，同一属性不重叠
function fbKicks(pl, times, amp = 2.8) {
  const rx = +pl.dataset.rx, ry = +pl.dataset.ry;
  let last = -9, sign = 1;
  [...times].sort((a, b) => a - b).forEach((t) => {
    if (t < last + 0.5) return;
    to(pl, t, { rotationY: ry + sign * amp, rotationX: rx - 1.4, duration: 0.12, ease: 'power2.out' });
    to(pl, t + 0.12, { rotationY: ry, rotationX: rx, duration: 0.36, ease: 'power2.inOut' });
    last = t; sign = -sign;
  });
}
const fbCrowd = `<svg width="230" height="150" viewBox="0 0 230 150"><g fill="#2a2a2a">` + [[30, 56, 18], [80, 40, 22], [130, 52, 19], [180, 42, 21], [208, 66, 15]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x - r * 1.5} 150 C${x - r * 1.5} ${y + r * 2} ${x - r} ${y + r * 1.4} ${x} ${y + r * 1.4} C${x + r} ${y + r * 1.4} ${x + r * 1.5} ${y + r * 2} ${x + r * 1.5} 150 Z"/>`).join('') + `</g></svg>`;
const fbPeople = `<svg width="170" height="150" viewBox="0 0 170 150"><g fill="#2a2a2a"><circle cx="52" cy="34" r="24"/><path d="M12 150 C12 92 28 68 52 68 C76 68 92 92 92 150 Z"/><circle cx="124" cy="46" r="20"/><path d="M90 150 C90 104 104 84 124 84 C144 84 158 104 158 150 Z"/></g></svg>`;

// ───── 通用部件 ─────
// 入场：从 from 到原位。只登记一次 set + to，不用 immediateRender
function fbIn(el, t, from = {}, o = {}) {
  init(el, { autoAlpha: 0, ...from });
  const end = { autoAlpha: 1 };
  for (const k of Object.keys(from)) if (typeof from[k] === 'number') end[k] = k === 'scale' ? 1 : 0;
  to(el, t, { ...end, ...(o.end || {}), duration: o.d || 0.34, ease: o.ease || 'power3.out' });
}
const fbOut = (el, t, end = {}) => to(el, t, { autoAlpha: 0, duration: 0.24, ease: 'power2.in', ...end });
function fbCard(parent, x, y, w, hgt, html, extra = {}) {
  const e = h('div', 'sheet', parent, html);
  css(e, { left: x + 'px', top: y + 'px', ...(w ? { width: w + 'px' } : {}), ...(hgt ? { height: hgt + 'px' } : {}), ...extra });
  return e;
}
function fbAbs(parent, x, y, html, cls = '') {
  const e = h('div', ('abs ' + cls).trim(), parent, html);
  css(e, { left: x + 'px', top: y + 'px' });
  return e;
}
// 一页内容换下一页：旧的整层淡走，新的接上
function fbSwap(a, b, t) {
  fbOut(a.parentNode, t, { duration: 0.2 });
  init(b.parentNode, { autoAlpha: 0 });
  to(b.parentNode, t + 0.12, { autoAlpha: 1, duration: 0.16 });
}
const fbDb = (w, flame) => `<svg width="${w}" height="${w * 1.25}" viewBox="0 0 120 150"><defs><linearGradient id="db${flame ? 'f' : 'g'}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${flame ? '#FAAC19' : '#dcdad4'}"/><stop offset="1" stop-color="${flame ? '#EE2B24' : '#b5b2ab'}"/></linearGradient></defs><path fill="url(#db${flame ? 'f' : 'g'})" d="M4 22 v106 a56 18 0 0 0 112 0 v-106 z"/><ellipse cx="60" cy="22" rx="56" ry="18" fill="${flame ? '#FBC45C' : '#f0efea'}"/><path fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" d="M4 60 a56 18 0 0 0 112 0 M4 98 a56 18 0 0 0 112 0"/></svg>`;
const fbPerson = (w = 110, c = '#2a2a2a') => `<svg width="${w}" height="${w * 1.3}" viewBox="0 0 100 130"><g fill="${c}"><circle cx="50" cy="34" r="26"/><path d="M8 130 C8 84 26 66 50 66 C74 66 92 84 92 130 Z"/></g></svg>`;
function fbMini(parent, x, y, top, big) {
  return fbAbs(parent, x, y, `<div class="b">${top}</div><div class="m">${big}</div>`, 'mini');
}
function fbBox(p, x, y, w, d, hgt, top, front, side) {
  const b = h('div', 'd3', p); init(b, { x, y });
  const face = (cssText) => { const f = h('div', 'abs', b); f.style.cssText += ';left:0;top:0;transform-origin:0 0;' + cssText; return f; };
  face(`width:${w}px;height:${d}px;background:${top};transform:translateZ(${hgt}px)`);
  face(`width:${w}px;height:${hgt}px;background:${front};transform:translate3d(0,${d}px,${hgt}px) rotateX(-90deg)`);
  face(`width:${d}px;height:${hgt}px;background:${side};transform:translate3d(${w}px,0,${hgt}px) rotateZ(90deg) rotateX(-90deg)`);
  return b;
}
const fbGrey = (p, x, y, w, d, hgt) => fbBox(p, x, y, w, d, hgt, '#efeee9', '#c6c3bc', '#d8d6cf');
function fbDrop(b, t, z = 0, from = 340) {
  init(b, { autoAlpha: 0, z: z + from });
  to(b, t, { autoAlpha: 1, z, duration: 0.42, ease: 'bounce.out' });
}
// 立在倾斜平面上的东西：外层抵消倾斜，内层做动画
function fbStand(parent, html, x, y, rx) {
  const o = fbAbs(parent, x, y, '');
  o.style.transformOrigin = '50% 100%';
  o.style.transform = `rotateX(${-rx}deg)`;
  return h('div', '', o, html);
}
function fbBrowser(parent, x, y, w, hgt, loadAt = null) {
  const el = fbCard(parent, x, y, w, hgt, '');
  css(el, { overflow: 'hidden' });
  h('div', 'br-bar', el);
  const tab = h('div', 'br-tab', el);
  for (let i = 0; i < 3; i++) css(h('div', 'br-dot', el), { left: 26 + i * 30 + 'px' });
  h('div', 'br-addr', el);
  const r = seeded(9);
  for (let i = 0; i < 7; i++) {
    const b = h('div', 'bar-l', el);
    css(b, { left: '50px', top: 170 + i * 46 + 'px', width: 300 + r() * (w - 460) + 'px' });
    if (loadAt != null) wipe(b, loadAt + i * 0.19, { dir: 'l', d: 0.2 });
  }
  const titles = (list) => {
    let prev = null;
    list.forEach(([txt, t]) => {
      const e = h('div', 'br-t', tab, txt);
      init(e, { autoAlpha: 0 });
      to(e, t, { autoAlpha: 1, duration: 0.14 });
      if (prev) to(prev, t, { autoAlpha: 0, duration: 0.1 });
      prev = e;
    });
  };
  return { el, tab, titles };
}
const fbBeat = (sc, t) => sc.start + Math.ceil((t - sc.start) / (60 / 118)) * (60 / 118);
