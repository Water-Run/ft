// 08 并发：表锁。主画面是随播放头推进的锁时间轴（旧版 WaterRun 点名喜欢的滚动动画，F23），按 D1 画成字符格：
// 实心格 = 持有锁（蓝绿读、橙色写），暗格 = 在排队。读锁共享、写锁独占（thr_lock）；bob 统计整张表时 carol 的修改只能等他读完；
// 例外是并发插入：中间没有空位时，插入追加在末尾，与查询同时进行，查询只读到它开始时的文件末尾；有了空位，插入又得排队。
// 时间轴是示意（FACTS「08」：演示排队关系，不对应实测时序）。
scene('s8', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const st = h('style', '', root); st.textContent = `
    .ln { position:absolute; height:2px; background:#2c2e31; }
    .gc { position:absolute; width:17px; height:44px; }
    .gc.r { background:#3fb4cc; } .gc.w { background:#F29111; } .gc.q { background:#2c2e31; }
    .ph { position:absolute; width:3px; background:#d9d9d9; }`;

  // 一组时间轴：lanes = [[名字, 语句]]，bars = [[道, 起, 止, 'r'|'w'|'q']]，pos(t) 给出播放头位置（单位）
  function gantt(x0, y0, lanes, bars, pos, o = {}) {
    const GX = x0 + (o.labW || 440), UNIT = o.unit || 120, LH = o.lh || 100, W = 10 * UNIT;
    const g = h('div', 'abs', world); px(g, 0, 0);
    lanes.forEach(([n, d], i) => {
      const y = y0 + i * LH;
      const l = h('div', 'ln', g); px(l, x0, y, GX - x0 + W, 2);
      const nm = h('div', 'abs mono', g, n); px(nm, x0, y + 14); css(nm, { fontSize: '34px', color: '#d9d9d9' });
      if (d) { const dd = h('div', 'abs', g, d); px(dd, x0, y + 58); css(dd, { font: '500 26px "Sans SC"', color: '#8a8a8a' }); }
    });
    const lb = h('div', 'ln', g); px(lb, x0, y0 + lanes.length * LH, GX - x0 + W, 2);
    const cells = bars.map(([lane, a, b, k]) => {
      const n = Math.round((b - a) * UNIT / 20), arr = [];
      for (let j = 0; j < n; j++) { const c = h('div', 'gc ' + k, g); px(c, GX + a * UNIT + j * 20, y0 + lane * LH + 28); arr.push(c); }
      return { a, b, arr };
    });
    const ph = h('div', 'ph', g); px(ph, GX, y0 - 16, 3, lanes.length * LH + 32);
    F((t) => {
      const p = pos(t);
      ph.style.left = (GX + p * UNIT) + 'px';
      for (const { a, arr } of cells) { const vis = Math.floor(Math.max(0, p - a) * UNIT / 20); arr.forEach((c, j) => { c.style.display = j < vis ? '' : 'none'; }); }
    });
    return { g, GX, UNIT, LH, y0 };
  }
  const seg = (pts) => (t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); return pts[pts.length - 1][1]; };

  // ── 第一站：表 users，整张表一把锁 ──
  const head = h('div', 'abs mono', world, '表 <span class="c-o">users</span>'); px(head, 140, 136); css(head, { fontSize: '40px', color: '#d9d9d9' });
  const lockL = h('div', 'abs t-big', world, '整张表一把锁'); px(lockL, 420, 128); css(lockL, { color: '#F29111' });
  appear(head, c0 + 0.1); slam(lockL, T('k2', '加锁') - 0.1, { from: 1.25 }); sfx('thud', T('k2', '加锁'), { g: 0.6 });
  const LANES = [['bob', 'SELECT · 统计整张表'], ['dave', 'SELECT'], ['carol', 'UPDATE · 改 alice 的年龄'], ['alice', 'SELECT']];
  const BARS = [[0, 0.2, 5.4, 'r'], [1, 0.9, 2.9, 'r'], [2, 2.4, 5.4, 'q'], [2, 5.4, 7.4, 'w'], [3, 6.0, 7.4, 'q'], [3, 7.4, 8.8, 'r']];
  const pos1 = seg([[T('k3') - 0.2, 0], [Tend('k3') + 0.3, 2.3], [T('k4', '写锁') - 0.1, 2.3], [Tend('k4') + 0.2, 9.2]]);
  const G1 = gantt(140, 280, LANES, BARS, pos1);
  vanish(G1.g, 0); appear(G1.g, T('k1') - 0.2); sfx('tick', T('k1') - 0.2, { g: 0.4 });
  const axis = tag(world, G1.GX + 10 * G1.UNIT - 120, 230, '时间 →'); appear(axis, T('k1'));
  const legend = h('div', 'abs', world); px(legend, 140, 720); legend.innerHTML = '<span class="mono" style="font-size:28px;color:#3fb4cc">■ 读 · 共享</span>　　<span class="mono" style="font-size:28px;color:#F29111">■ 写 · 独占</span>　　<span class="mono" style="font-size:28px;color:#808080">■ 排队</span>';
  appear(legend, T('k3', '读锁') - 0.2);
  sfx('blip', T('k3', '共享'), { g: 0.4 }); sfx('error', T('k4', '等待') - 0.4, { g: 0.4 }); sfx('pop', T('k4', '一个连接'), { g: 0.4 });
  // bob 正在统计整张表；carol 只能等 bob 读完
  const ringB = ring(world, { x: G1.GX + 0.2 * G1.UNIT - 6, y: 280 + 22, w: 5.2 * G1.UNIT + 8, h: 58 }, 't');
  const ringC = ring(world, { x: G1.GX + 2.4 * G1.UNIT - 6, y: 280 + 2 * G1.LH + 22, w: 3.0 * G1.UNIT + 8, h: 58 });
  vanish(ringB, 0); vanish(ringC, 0);
  appear(ringB, T('k4b', '统计') - 0.2); appear(ringC, T('k4c', '只能') - 0.2);
  const until = path(ov, `M ${G1.GX + 5.4 * G1.UNIT} ${280 + 80} L ${G1.GX + 5.4 * G1.UNIT} ${280 + 2 * G1.LH + 20}`, 'orange', { w: 3 });
  arrowIn(until, T('k4c', '读完') - 0.2, 0.4); sfx('tick', T('k4c', '读完'), { g: 0.5 });
  vanish(ringB, T('k5') - 0.3); vanish(ringC, T('k5') - 0.3);

  // ── 第二站：并发插入。中间没有空位：查询读到它开始时的末尾为止，插入同时追加在后面 ──
  const SX = 2140, SY = 470, CW = 66;
  const ciT = h('div', 'abs t-big', world, '并发插入'); px(ciT, SX, 200); css(ciT, { color: '#F29111' });
  const cond = h('div', 'abs c-t', world, '中间没有空位'); px(cond, SX, 290); css(cond, { font: '500 32px "Sans SC"' });   // 字色由类名给，后面换成红色
  const strip = [...Array(20)].map((_, i) => { const e = h('div', 'abs', world); px(e, SX + i * CW, SY, CW - 8, 70); css(e, { background: i < 12 ? '#2b606c' : '#F29111' }); return e; });
  const endX = SX + 12 * CW - 4;
  const endM = h('div', 'abs', world); px(endM, endX, SY - 40, 4, 150); css(endM, { background: '#d9d9d9' });
  const endL = tag(world, endX - 330, SY - 80, '查询开始时的文件末尾');
  const fileL = tag(world, SX, SY - 80, 'users.MYD'); appear(fileL, T('k5') - 0.1);
  const cur = ring(world, { x: SX - 6, y: SY - 6, w: CW + 4, h: 82 }, 't');
  const curL = tag(world, SX, SY + 96, 'SELECT 读到末尾为止', 'c-t'), insL = tag(world, endX + 20, SY + 96, 'INSERT 追加在后面', 'c-o');
  const tCI = T('k5') - 0.3;
  strip.slice(0, 12).forEach((e, i) => appear(e, T('k5') - 0.1 + i * 0.03)); sfx('drive', T('k5') - 0.1, { g: 0.5 });
  appear(cond, T('k6', '没有空位') - 0.2); appear(endM, T('k6', '末尾') - 0.3); appear(endL, T('k6', '末尾') - 0.2);
  slam(ciT, T('k7', '并发') - 0.1, { from: 1.25 }); sfx('thud', T('k7', '并发'), { g: 0.55 });
  const tR0 = T('k7') - 0.1, tR1 = Tend('k7') + 0.4;
  vanish(cur, 0); appear(cur, tR0); appear(curL, tR0);
  F((t) => { const k = ease.io3(clamp((t - tR0) / (tR1 - tR0))); cur.style.left = (SX - 6 + k * 11 * CW) + 'px'; });
  strip.slice(12, 17).forEach((e, i) => { vanish(e, 0); fromTo(e, T('k7', '插入') + i * 0.45, { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' }); sfx('pop', T('k7', '插入') + i * 0.45, { g: 0.4 }); });
  strip.slice(17).forEach((e) => vanish(e, 0));
  appear(insL, T('k7', '插入'));
  // 中间有了空位：新行要先去填空位，插入又得排队
  const tH = T('k7b') - 0.2;
  const hole = h('div', 'abs', world); px(hole, SX + 4 * CW, SY, CW - 8, 70); css(hole, { background: '#0b0b0c', border: '3px solid #e5534b' });
  vanish(hole, 0); appear(hole, tH); sfx('error', tH, { g: 0.45 });
  keyed(cond).at(tH, { html: '中间有一个空位', cls: 'abs c-r' });
  const newR = h('div', 'abs', world); px(newR, SX + 4 * CW, SY - 170, CW - 8, 70); css(newR, { background: '#F29111' });
  vanish(newR, 0); appear(newR, T('k7b', '新行') - 0.1);
  const toHole = path(ov, `M ${SX + 4 * CW + 29} ${SY - 96} L ${SX + 4 * CW + 29} ${SY - 8}`, 'red', { w: 3, dashed: '8 8' });
  arrowIn(toHole, T('k7b', '填空位') - 0.2, 0.4);
  const wait = h('div', 'abs mono', world, '░░░ 等查询读完'); px(wait, SX + 4 * CW + 80, SY - 160); css(wait, { fontSize: '30px', color: '#808080' });
  appear(wait, T('k7b', '排队') - 0.2); sfx('tick', T('k7b', '排队'), { g: 0.5 });
  [insL, curL].forEach((e) => vanish(e, tH));

  // ── 第三站：读多写少，开销很小；写入一多，整张表成了瓶颈 ──
  const RX = 4140;
  const rl = [['连接 1', ''], ['连接 2', ''], ['连接 3', ''], ['连接 4', '']];
  const rb = []; for (let l = 0; l < 4; l++) for (let j = 0; j < 4; j++) { const a = 0.15 + j * 2.4 + l * 0.3; rb.push([l, a, Math.min(a + 2.1, 9.8), 'r']); }
  const G2 = gantt(RX, 200, rl, rb, seg([[T('k8') - 0.3, 0], [Tend('k8') + 0.3, 9.9]]), { labW: 220, lh: 84 });
  vanish(G2.g, 0); appear(G2.g, T('k8') - 0.4);
  const v1 = lab(world, RX + 220, 560, '全是读锁：互不阻塞，开销很小', 'c-t'); appear(v1, T('k8', '开销') - 0.3); sfx('chime', T('k8', '很小'), { g: 0.35 });
  const wl = [['连接 1', ''], ['连接 2', ''], ['连接 3', ''], ['连接 4', '']];
  const wb = [[0, 0.2, 1.8, 'w'], [1, 0.4, 1.8, 'q'], [1, 1.8, 3.4, 'w'], [2, 0.7, 3.4, 'q'], [2, 3.4, 5.0, 'w'], [3, 1.0, 5.0, 'q'], [3, 5.0, 6.6, 'w'], [0, 2.4, 6.6, 'q'], [0, 6.6, 8.2, 'w'], [1, 4.0, 8.2, 'q'], [1, 8.2, 9.8, 'w']];
  const G3 = gantt(RX, 660, wl, wb, seg([[T('k9') - 0.3, 0], [Tend('k9') + 0.6, 9.9]]), { labW: 220, lh: 70 });
  vanish(G3.g, 0); appear(G3.g, T('k9') - 0.4);
  const v2 = lab(world, RX + 1100, 600, '写入一多：同一时刻只有一个能写', 'c-o'); appear(v2, T('k9', '瓶颈') - 0.4); sfx('error', T('k9', '瓶颈'), { g: 0.45 });
  sfx('tick', T('k9') - 0.3, { g: 0.4 });

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.02 }, T('k4b') - c0 - 0.5, { ease: 'none', sfx: false }],
    [T('k4b') - 0.3, { x: 1060, y: 380, z: 1.22 }, 0.9, { sfx: false }],
    [T('k4c') - 0.2, { x: 1060, y: 560, z: 1.22 }, 0.9, { sfx: false }],
    [Tend('k4c') + 0.2, { x: 2880, y: 480, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.03 }, T('k8') - Tend('k4c') - 1.8, { ease: 'none', sfx: false }],
    [T('k8') - 0.5, { x: 4950, y: 560, z: 0.96 }, 1.0, { g: 0.5 }],
    [null, { z: 0.98 }, s.end - T('k8') - 0.8, { ease: 'none', sfx: false }],
  ]);
});
