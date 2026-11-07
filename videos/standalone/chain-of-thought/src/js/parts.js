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
      keys.forEach(([t, v, d = 1.4, o = {}], i) => {
        const tt = t == null ? prevEnd + 0.15 : t, next = { ...cur, ...v };
        // 每段在下一段开始之前走完：两段在时间上重叠，画面就依赖播放历史
        const nt = keys[i + 1] && keys[i + 1][0];
        const dd = nt != null ? Math.max(0.2, Math.min(d, nt - tt - 0.02)) : d;
        tl.fromTo(st, { ...cur }, { ...next, duration: dd, ease: o.ease || 'power2.inOut', immediateRender: true }, tt);
        cur = next; prevEnd = tt + dd;
      });
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

// 一行字分块写出来，像模型一次写一小块；返回 { e, end }（写完的时刻）
function stream(parent, text, x, y, size, t, cps = 16, cls = '') {
  const e = ln(parent, '', x, y, size, cls);
  appear(e, t);
  const parts = text.match(/\d{1,3}|[^\d]{1,2}/g);
  let tt = t;
  for (const p of parts) { const sp = h('span', '', e, esc(p)); appear(sp, tt); tt += p.length / cps; }
  return { e, end: tt };
}

// 纸的抬头：小字编号、标题、一条细线
function header(sh, no, lab, w, t) {
  const a = h('div', 'no', sh, no); px(a, 44, 34);
  const b = h('div', 'lab', sh, lab); px(b, 44, 70);
  const r = h('div', 'hair', sh); px(r, 44, 128, w - 88, 2);
  show(a, t, { y: 8, d: 0.4 }); show(b, t + 0.08, { y: 8, d: 0.45 });
  fromTo(r, t + 0.15, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' });
  sfx('tick', t, { g: 0.35 });
  return { a, b, r };
}

// 纸上的一段文字（可换行）
function para(parent, html, x, y, w, size = 28, cls = '') {
  const e = h('div', 'abs ' + cls, parent, html);
  css(e, { left: x + 'px', top: y + 'px', width: w + 'px', whiteSpace: 'normal', font: `400 ${size}px "Serif SC"`, lineHeight: '1.6', color: '#1c1c1c' });
  return e;
}

// 印在纸上的横向条形：一行一条，宽度按数值；返回 [{ row, bar, num }]
// rows: [{ label, value, max, text, cls }]，x/y 为左上角，w 为满格宽度
function barRows(parent, rows, x, y, w, gap = 64, labW = 220) {
  return rows.map((r, i) => {
    const row = h('div', 'abs', parent); px(row, x, y + i * gap, labW + w + 140, gap - 14);
    const lab = h('div', 'abs note', row, r.label); px(lab, 0, 4); css(lab, { fontSize: '26px', color: '#555' });
    const track = h('div', 'abs', row); px(track, labW, 10, w, 26); css(track, { background: '#f1f1f1' });
    row.track = track;
    const bar = h('div', 'abs', row); px(bar, labW, 10, Math.max(2, w * r.value / r.max), 26); css(bar, { background: r.cls === 'err' ? '#a5402d' : '#1c1c1c', transformOrigin: '0 50%' });
    const num = h('div', 'abs ln', row, r.text); px(num, labW + Math.max(2, w * r.value / r.max) + 14, 0, null); css(num, { fontSize: '28px' });
    return { row, bar, num, lab, track };
  });
}
// 条形逐行长出来；ts 可以是一个起始时刻（逐行错开 step 秒），也可以是每行各自的时刻
function growRows(rows, ts, step = 0.12) {
  rows.forEach((r, i) => {
    const t = Array.isArray(ts) ? ts[i] : ts + i * step;
    show(r.lab, t, { y: 6, d: 0.35 }); show(r.track, t, { y: 0, d: 0.3 });
    fromTo(r.bar, t + 0.05, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }); show(r.num, t + 0.5, { y: 0, x: -6, d: 0.35 });
  });
}

// 抽象的文字行（没有必要读出来的内容用灰条表示）
function greyLines(parent, x, y, widths, gap = 40, hh = 12) {
  return widths.map((w, i) => { const e = h('div', 'abs', parent); px(e, x, y + i * gap, w, hh); css(e, { background: '#e4e4e4', borderRadius: '6px' }); return e; });
}

// 纸上的一块淡灰底（标出一段）；插在最底层，不压字
function band(parent, x, y, w, hh) {
  const e = h('div', 'abs', parent); px(e, x, y, w, hh); css(e, { background: 'rgba(0,0,0,.05)' });
  parent.insertBefore(e, parent.firstChild);
  return e;
}
