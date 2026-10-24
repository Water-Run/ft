// 08 并发：表锁。主画面是随播放头推进的锁时间轴（旧版 WaterRun 点名喜欢的滚动动画，F23），按 D1 画成字符格：
// 实心格 = 持有锁（蓝绿读、橙色写），暗格 = 在排队。读锁共享、写锁独占（thr_lock）；bob 统计整张表时 carol 的修改只能等他读完；
// 例外是并发插入：中间没有空位时，插入追加在末尾，与查询同时进行，查询只读到它开始时的文件末尾；有了空位，插入又得排队。
// 时间轴是示意（FACTS「08」：演示排队关系，不对应实测时序）。
scene('s8', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
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
      const dd = d ? h('div', 'abs', g, d) : null; if (dd) { px(dd, x0, y + 58); css(dd, { font: '500 26px "Sans SC"', color: '#8a8a8a' }); }
      if (o.reveal) {   // 泳道逐条出现：整条泳道的底色先亮一下再淡掉
        const tr = o.reveal[0] + i * o.reveal[1], band = h('div', 'abs', g); px(band, x0 - 12, y + 4, GX - x0 + W + 12, LH - 8); css(band, { background: '#3fb4cc' });
        F((t) => { const k = (t - tr) / 1.2; band.style.opacity = k >= 0 && k < 1 ? (0.22 * (1 - k)).toFixed(3) : '0'; });   // 不透明度直接由 t 算出
        [l, nm, dd].forEach((e) => { if (e) slide(e, tr, { x: -24, d: 0.4 }); });
      }
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
  appear(head, c0 + 0.1);
  const LANES = [['bob', 'SELECT · 统计整张表'], ['dave', 'SELECT'], ['carol', 'UPDATE · 改 alice 的年龄'], ['alice', 'SELECT']];
  const BARS = [[0, 0.2, 5.4, 'r'], [1, 0.9, 2.9, 'r'], [2, 2.4, 5.4, 'q'], [2, 5.4, 7.4, 'w'], [3, 6.0, 7.4, 'q'], [3, 7.4, 8.8, 'r']];
  // 播放头从 bob 开始统计整张表时就在走：讲到读锁共享时，dave 也读进来
  // 播放头对准旁白（WaterRun：「写锁是独占的 说的是否写还很远」）：讲读锁共享时 dave 跟着读、carol 开始排队；
  // 讲到「写锁」的那一刻 bob 正好读完、carol 开始写；「一个连接在写」时写锁条在长；「其他连接都要等待」时 alice 在排队
  const pos1 = seg([[T('k1'), 0], [T('k3') - 0.2, 0.9], [T('k4', '写锁') - 0.1, 5.4], [T('k4', '在写') + 0.2, 7.0], [T('k4', '等待') + 0.2, 7.6], [Tend('k4') + 0.6, 9.2]]);
  const G1 = gantt(140, 280, LANES, BARS, pos1, { reveal: [T('k1') - 0.2, 0.55] });
  vanish(G1.g, 0); appear(G1.g, c0 + 0.2); sfx('tick', c0 + 0.2, { g: 0.4 });   // 四条泳道一开场就在，播放头从 k1 起走
  // 「整张表一把锁」：一个框把四条泳道整个圈住
  const all = ring(world, { x: 126, y: 270, w: G1.GX - 140 + 10 * G1.UNIT + 28, h: 4 * G1.LH + 8 }, 'o');
  vanish(all, 0); appear(all, T('k2', '加锁') - 0.1); vanish(all, T('k3') - 0.1); sfx('thud', T('k2', '加锁'), { g: 0.5 });
  const axis = tag(world, G1.GX + 10 * G1.UNIT - 120, 230, '时间 →'); appear(axis, T('k1'));
  const legend = h('div', 'abs', world); px(legend, 140, 720); legend.innerHTML = '<span class="mono" style="font-size:28px;color:#3fb4cc">■ 读 · 共享</span>　　<span class="mono" style="font-size:28px;color:#F29111">■ 写 · 独占</span>　　<span class="mono" style="font-size:28px;color:#808080">■ 排队</span>';
  appear(legend, T('k1') + 2.0);   // 图例随泳道一起在场，不在讲解中途弹出
  sfx('blip', T('k3', '共享'), { g: 0.4 }); sfx('error', T('k4', '等待') - 0.4, { g: 0.4 }); sfx('pop', T('k4', '一个连接'), { g: 0.4 });
  // bob 正在统计整张表；carol 只能等 bob 读完
  const ringB = ring(world, { x: G1.GX + 0.2 * G1.UNIT - 6, y: 280 + 22, w: 5.2 * G1.UNIT + 8, h: 58 }, 't');
  const ringC = ring(world, { x: G1.GX + 2.4 * G1.UNIT - 6, y: 280 + 2 * G1.LH + 22, w: 3.0 * G1.UNIT + 8, h: 58 });
  vanish(ringB, 0); vanish(ringC, 0);
  appear(ringB, T('k4b', '统计') - 0.2); appear(ringC, T('k4c', '只能') - 0.2);
  const until = path(ov, `M ${G1.GX + 5.4 * G1.UNIT} ${280 + 80} L ${G1.GX + 5.4 * G1.UNIT} ${280 + 2 * G1.LH + 20}`, 'orange', { w: 3 });
  arrowIn(until, T('k4c', '读完') - 0.2, 0.4); sfx('tick', T('k4c', '读完'), { g: 0.5 });
  vanish(ringB, T('k5') - 0.3); vanish(ringC, T('k5') - 0.3);
  // bob 在统计整张表：一个亮格沿着 bob 的读锁条从头扫到尾；carol 等着：她的框一闪一闪
  const scanC = h('div', 'abs', world); px(scanC, 0, 280 + 28, 16, 44); css(scanC, { background: '#d9d9d9' });
  vanish(scanC, 0); appear(scanC, T('k4b') - 0.1); vanish(scanC, T('k4c') - 0.1);
  F((t) => { const k = clamp((t - T('k4b')) / Math.max(1, Tend('k4b') - T('k4b'))); scanC.style.left = (G1.GX + (0.2 + k * 5.0) * G1.UNIT) + 'px'; });
  F((t) => { ringC.style.opacity = t >= T('k4c', '只能') && t < T('k5') - 0.3 && Math.floor((t - T('k4c', '只能')) / 0.5) % 2 ? '0.3' : '1'; });

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
  strip.slice(0, 12).forEach((e, i) => slide(e, T('k5') - 0.1 + i * 0.3, { y: -40, d: 0.35 })); sfx('drive', T('k5') - 0.1, { g: 0.5 });   // 文件一行一行落下来
  slide(cond, T('k6') - 0.1, { x: -24, d: 0.4 }); appear(endM, T('k6', '末尾') - 0.15); appear(endL, T('k6', '末尾') - 0.1);
  slam(ciT, T('k7', '并发') - 0.1, { from: 1.25 }); sfx('thud', T('k7', '并发'), { g: 0.55 });
  const tR0 = T('k6') + 0.8, tR1 = Tend('k7') + 0.4;   // 查询在 k6 开头就开始读，读到它开始时的末尾为止
  vanish(cur, 0); appear(cur, tR0); appear(curL, tR0);
  // 有空位时又来一次查询：读游标重新从头读；读完之后，排队的新行才填进空位
  const tQ0 = T('k7b') + 0.2, tFill = Math.min(Tend('k7b') + 1.9, T('k8') - 0.8);
  // 查询读过的那一段：一条淡色带跟着读游标往前长
  const readBand = h('div', 'abs', world); px(readBand, SX - 8, SY - 10, 0, 90); css(readBand, { background: '#3fb4cc', opacity: '0.2' });
  F((t) => { const k = t < tQ0 ? ease.io3(clamp((t - tR0) / (tR1 - tR0))) : clamp((t - tQ0) / (tFill - 0.2 - tQ0)); cur.style.left = (SX - 6 + k * 11 * CW) + 'px'; readBand.style.width = (t < tR0 ? 0 : k * 11 * CW + CW + 4) + 'px'; });
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
  appear(wait, T('k7b', '排队') - 0.15); sfx('tick', T('k7b', '排队') - 0.15, { g: 0.5 });
  fromTo(newR, tFill, { y: 0 }, { y: 170, duration: 0.4, ease: 'power3.in', immediateRender: false }); vanish(wait, tFill); tl.to(toHole, { autoAlpha: 0, duration: 0.2 }, tFill);
  sfx('pop', tFill + 0.4, { g: 0.45 });
  [insL, curL].forEach((e) => vanish(e, tH));

  // ── 第三站：读多写少，开销很小；写入一多，整张表成了瓶颈 ──
  const RX = 4140;
  const rl = [['连接 1', ''], ['连接 2', ''], ['连接 3', ''], ['连接 4', '']];
  // 读多写少：读锁大量重叠；中间只有连接 3 写了一次，写的那一小段别人短暂排队（WaterRun：「读多写少 读少写多 动画变成只有读和只有写」）
  const rb = [[0, 0.2, 2.2, 'r'], [0, 2.6, 4.6, 'r'], [0, 5.6, 7.6, 'r'], [0, 8.0, 9.8, 'r'],
    [1, 0.5, 2.5, 'r'], [1, 2.9, 4.7, 'r'], [1, 5.6, 7.9, 'r'], [1, 8.3, 9.8, 'r'],
    [2, 0.8, 2.8, 'r'], [2, 4.3, 4.7, 'q'], [2, 4.7, 5.4, 'w'], [2, 5.7, 7.7, 'r'], [2, 8.1, 9.8, 'r'],
    [3, 1.1, 3.1, 'r'], [3, 3.3, 4.6, 'r'], [3, 5.0, 5.4, 'q'], [3, 5.4, 7.4, 'r'], [3, 7.8, 9.8, 'r']];
  const G2 = gantt(RX, 200, rl, rb, seg([[T('k8') - 0.3, 0], [Tend('k8') + 0.3, 9.9]]), { labW: 220, lh: 84 });
  vanish(G2.g, 0); appear(G2.g, T('k8') - 0.4);
  sfx('chime', T('k8', '很小'), { g: 0.35 });
  const wl = [['连接 1', ''], ['连接 2', ''], ['连接 3', ''], ['连接 4', '']];
  // 写多：写锁一个接一个串行；连接 4 只是读，也得在写锁之间排队
  const wb = [[0, 0.2, 1.6, 'w'], [0, 2.4, 5.0, 'q'], [0, 5.0, 6.4, 'w'],
    [1, 0.4, 1.6, 'q'], [1, 1.6, 3.0, 'w'], [1, 4.0, 7.0, 'q'], [1, 7.0, 8.4, 'w'],
    [2, 0.7, 3.6, 'q'], [2, 3.6, 5.0, 'w'], [2, 6.0, 8.4, 'q'], [2, 8.4, 9.8, 'w'],
    [3, 1.0, 3.0, 'q'], [3, 3.0, 3.6, 'r'], [3, 4.2, 6.4, 'q'], [3, 6.4, 7.0, 'r'], [3, 8.0, 9.8, 'q']];
  const G3 = gantt(RX, 660, wl, wb, seg([[T('k9') - 0.3, 0], [Tend('k9') + 0.6, 9.9]]), { labW: 220, lh: 70 });
  vanish(G3.g, 0); appear(G3.g, T('k9') - 0.4);
  sfx('error', T('k9', '瓶颈'), { g: 0.45 });
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
