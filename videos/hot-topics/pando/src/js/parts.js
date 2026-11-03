// 本片的部件：场景底色、服务器、包、电脑（人、智能体、测试任务）、轻量的镜头停留。
// 所有动作仍走引擎的登记函数，画面只由 t 决定。

// 场景底色：n 中性 / o OpenAI / a Anthropic
function sceneBg(root, k) { root.classList.add('bg-' + k); }

// 停留：整场朝一个方向极慢横移（一屏不超过 48 像素、每秒不超过 2 像素）；dir 为 1 向右、-1 向左
function drift(cam, s, dir = 1, x0 = 960, y0 = 540) {
  const hold = s.end - s.start - 0.2, dx = Math.min(40, 1.6 * hold) * dir;
  cam.track(s.start, { x: x0 - dx / 2, y: y0, z: 1 }, [[s.start + 0.1, { x: x0 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
}

// 一台电脑：kind 为 '' 人 / 'agent' 智能体 / 'job' 测试任务
function node(parent, x, y, name, kind = '') {
  const n = h('div', 'node ' + kind, parent, `<div class="ic"></div><div class="nm">${name}</div>`);
  n.dataset.name = name || kind || '电脑';
  px(n, x, y); n.style.transform = 'translateX(-50%)';
  return n;
}

// 服务器：label 主名，sub 小字
function server(parent, x, y, w, hgt, label, sub = '') {
  const e = h('div', 'srv', parent, `<div class="lab">${label}</div>${sub ? `<div class="sub">${sub}</div>` : ''}`);
  px(e, x, y, w, hgt); e.dataset.name = label;
  return e;
}

// 一个包（小方块），从 (x0,y0) 在 t 时刻出现并在 d 秒内飞到 (x1,y1)；返回元素
function packet(parent, cls, x0, y0, x1, y1, t, d = 0.7, o = {}) {
  const p = h('div', 'pk ' + (cls || ''), parent); px(p, x0 - 22, y0 - 22);
  p.dataset.name = o.name || '包';
  fromTo(p, t, { autoAlpha: 0, x: 0, y: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out', immediateRender: true });
  to(p, t + 0.12, { x: x1 - x0, y: y1 - y0, duration: d, ease: o.ease || 'power2.inOut' });
  if (o.fadeAt != null) to(p, o.fadeAt, { autoAlpha: 0, duration: 0.25 });
  return p;
}

// 一条细线（SVG），从 (x0,y0) 到 (x1,y1)，t 时刻描出
function line(ov, x0, y0, x1, y1, t, color = 'ink', o = {}) {
  const p = path(ov, `M${x0},${y0} L${x1},${y1}`, color, { w: o.w || 4, arrow: o.arrow !== false, dashed: o.dashed, opacity: o.opacity });
  if (o.arrow === false) draw(p, t, o.d || 0.5); else arrowIn(p, t, o.d || 0.5);   // 带箭头的线：箭头随线一起出现
  return p;
}

// 一条横线（DOM），t 时刻从左长出
function rule(parent, x, y, w, t, cls = 'o-rule', d = 0.6) {
  const r = h('div', cls, parent); px(r, x, y, w);
  fromTo(r, t, { scaleX: 0 }, { scaleX: 1, duration: d, ease: 'power3.inOut', immediateRender: true });
  return r;
}

// 一道删除线：t 时刻从左划过元素
function strike(parent, x, y, w, t, color) {
  const m = h('div', 'xmark', parent); px(m, x, y, w); if (color) m.style.background = color;
  fromTo(m, t, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out', immediateRender: true });
  return m;
}
