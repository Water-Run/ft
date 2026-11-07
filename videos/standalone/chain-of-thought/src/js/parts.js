// 本片的部件：一张立体桌面（rig 控制它的位置、倾角与远近，相当于镜头）、纸、token 方块、面向镜头的标签。
// 桌面的变换写成 rotateX(rx) rotateZ(rz)：先在桌面里转，再朝镜头倾斜，透视自然；标签用反向的旋转抵消，始终正对镜头。
// rig.track 与引擎的 cam.track 同一写法：每段显式给出起点与终点，画面只由 t 决定。

function makeDesk(root, start) {
  const view = h('div', 'view', root);
  const desk = h('div', 'desk', view);
  const st = { x: 960, y: 540, rx: 30, rz: 0, k: 1, ...start };
  const apply = () => { desk.style.left = st.x + 'px'; desk.style.top = st.y + 'px'; desk.style.transform = `scale3d(${st.k}, ${st.k}, ${st.k}) rotateX(${st.rx}deg) rotateZ(${st.rz}deg)`; };
  F(apply); apply();
  const boards = [];
  F(() => { for (const b of boards) b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, ${b.z}px) rotateZ(${-st.rz}deg) rotateX(${-st.rx}deg) translateX(${b.dx}px)`; });
  const rig = {
    st,
    track(startT, s0, keys) {
      let cur = { ...st, ...s0 }, prevEnd = startT;
      tl.set(st, { ...cur }, startT);
      for (const [t, v, d = 1.4, o = {}] of keys) {
        const tt = t == null ? prevEnd + 0.15 : t, next = { ...cur, ...v };
        tl.fromTo(st, { ...cur }, { ...next, duration: d, ease: o.ease || 'power2.inOut', immediateRender: true }, tt);
        cur = next; prevEnd = tt + d;
      }
    },
  };
  // 面向镜头的标签：x、y、z 是桌面上的位置，dx 把标签整体左移（-宽度/2 即居中）
  const board = (html, x, y, z, dx = 0, cls = '') => { const el = h('div', 'bb ' + cls, desk, html); boards.push({ el, x, y, z, dx }); return el; };
  return { view, desk, rig, board };
}

// 一张纸：带一层淡投影；z 是离桌面的高度
function sheet(desk, x, y, w, hh, z = 0, shadow = 0.7) {
  const sh = h('div', 'shadow', desk); css(sh, { left: x + 18 + 'px', top: y + 26 + 'px', width: w - 10 + 'px', height: hh - 10 + 'px', opacity: shadow });
  const p = h('div', 'sheet p3', desk); css(p, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', transform: `translateZ(${z}px)` });
  p.shadowEl = sh;
  return p;
}

// 纸上的一行字
function ln(parent, html, x, y, size, cls = '') {
  const e = h('div', 'ln ' + cls, parent, html);
  css(e, { left: x + 'px', top: y + 'px', ...(size ? { fontSize: size + 'px' } : {}) });
  return e;
}

// 一块 token：顶面写字，前面与右面给出厚度
function tile(parent, txt, x, y, w, hh, d) {
  const t = h('div', 'tile', parent); css(t, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' });
  const fr = h('div', 'fr', t); css(fr, { width: w + 'px', height: d + 'px', top: hh - d + 'px', transform: 'rotateX(-90deg)' });
  const rt = h('div', 'rt', t); css(rt, { width: d + 'px', height: hh + 'px', left: w - d + 'px', transform: 'rotateY(90deg)' });
  const top = h('div', 'top', t, txt); css(top, { width: w + 'px', height: hh + 'px', transform: `translateZ(${d}px)` });
  t.top = top;
  return t;
}

// 在纸上画一层 SVG（细线、弧线）
function inkLayer(parent, w, hh) {
  const s = svg('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent);
  css(s, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  return s;
}
