// 本片的小部件：一页手册、带透视的层、火焰色的立体字。
function fbExt(n, c1, c2, dx = 1, dy = 1) {
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = hex(c1), B = hex(c2), o = [];
  for (let i = 1; i <= n; i++) o.push(`${(i * dx).toFixed(1)}px ${(i * dy).toFixed(1)}px 0 rgb(${A.map((v, k) => Math.round(v + (B[k] - v) * i / n)).join(',')})`);
  return o.join(',');
}
function fbPage(root, s, c0) {
  const pg = h('div', 'page', root);
  if (s.chap) {
    const dh = h('div', 'dh', pg, `${s.chap[0]}. ${s.chap[1]}`);
    const dr = h('div', 'dr', pg);
    show(dh, c0 + 0.05, { x: -30, d: 0.45 });
    set(dr, 0, { scaleX: 0 }); to(dr, c0 + 0.1, { scaleX: 1, duration: 0.5, ease: 'power3.out' });
    sfx('thud', c0 + 0.05, { g: 0.7 });
  }
  return pg;
}
function fbPlane(pg, rx, ry, rz = 0, persp = 1800, origin = '55% 32%') {
  const p = h('div', 'persp', pg);
  css(p, { perspective: persp + 'px', perspectiveOrigin: origin });
  const pl = h('div', 'plane', p);
  css(pl, { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` });
  return pl;
}
const fbPeople = `<svg width="170" height="150" viewBox="0 0 170 150"><g fill="#2a2a2a"><circle cx="52" cy="34" r="24"/><path d="M12 150 C12 92 28 68 52 68 C76 68 92 92 92 150 Z"/><circle cx="124" cy="46" r="20"/><path d="M90 150 C90 104 104 84 124 84 C144 84 158 104 158 150 Z"/></g></svg>`;
