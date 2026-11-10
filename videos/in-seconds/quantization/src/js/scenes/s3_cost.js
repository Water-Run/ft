// 丢了什么：四个不同的数，换成了同一个值（c1–c2）；每个数都偏了一点（c3）；
// 说出来的词：4 位的每 100 个词约 5 个不一样（c4）；每个词都接着前面的说（c5）；岔开以后越走越偏（c6）。
// 数据：c1–c3 的 32 个数来自第 1000 组（data.js），c4–c6 的 100 词格来自 Quesma 的一致率 94.8%（FACTS E13）。
(function () {
  const { el, ramp, grad, bands, xOf, valueOfCode, G, D } = QZ;
  scene('cost', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);
    const BX = 144, BW = 1584, BY = 404, BH = 70, CY = 675;
    const X = (v) => xOf(v, BX, BW);
    const four = [2, 3, 14, 23];                                  // 同一个格子（格子号 13）的四个数
    const gone = [];                                              // c4 时收走的元素

    // 16 个格子（与 s2_how 同一位置）
    const blocks = (t0) => {
      const out = [];
      for (let c = 0; c < 16; c++) {
        const cx = X(valueOfCode(c));
        const b = el(world, cx - 40, 640, 80, 70, { background: ramp(c / 15), borderRadius: '14px' });
        appear(b, t0 + c * 0.03); out.push(b);
        const n = el(world, cx - 40, 718, 80, 36, { textAlign: 'center' }, String(c), 'lbl-m');
        appear(n, t0 + c * 0.03); out.push(n);
      }
      return out;
    };
    const dotOf = (i) => el(world, X(G.values[i]) - 9, 419 + (i % 3) * 20 - 9, 18, 18, {}, '', 'dot');

    // c1：四个数各不相同，用引线标出来
    const band = el(world, BX, BY, BW, BH, { background: grad(), borderRadius: '35px', boxShadow: '0 0 48px #A855F7' });
    wipe(band, T('c1'), { dir: 'l', d: 0.5 }); gone.push(band);
    const svgA = svg('svg', { class: 'ov', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world); gone.push(svgA);
    const labX = [520, 840, 1160, 1480];
    const fourDots = four.map((i) => {
      const d = dotOf(i); appear(d, T('c1') + 0.2); gone.push(d); return d;
    });
    four.forEach((i, k) => {
      const lab = el(world, labX[k], 236, 260, 52, { textAlign: 'center', font: '400 40px/1 "Inter", "Sans SC"' }, G.values[i].toFixed(6));
      appear(lab, T('c1') + 0.5 + k * 0.1); gone.push(lab);
      const dx = X(G.values[i]);
      const p = svg('path', { d: `M${labX[k] + 130},292 L${dx},${(419 + (i % 3) * 20 - 12)}`, stroke: '#FFFFFF', 'stroke-width': 2, fill: 'none', opacity: 0.6 }, svgA);
      draw(p, T('c1') + 0.6 + k * 0.1, 0.5);
    });
    sfx('pop', T('c1') + 0.2, { g: 0.6 });

    // c2：现在换成了同一个值，一模一样：四个点落到同一格，格子圈出来
    const hideC1 = [...gone];
    hideC1.forEach((e) => hide(e, T('c2') - 0.05, { d: 0.25, y: 0 }));
    const bl = blocks(T('c2') + 0.05);
    gone.push(...bl);
    const tx13 = X(valueOfCode(13));
    fourDots.forEach((d, k) => {
      const cx = X(G.values[four[k]]);
      const cy = 419 + (four[k] % 3) * 20;
      const moving = el(world, cx - 9, cy - 9, 18, 18, {}, '', 'dot dot-hot');
      appear(moving, T('c2') + 0.05); fromTo(moving, T('c2') + 0.2 + k * 0.02, { left: cx - 9, top: cy - 9 }, { left: tx13 - 9, top: CY - 9, duration: 0.5, ease: 'power2.inOut' });
      gone.push(moving);
    });
    const ring = el(world, tx13 - 46, 630, 92, 90, { border: '3px solid #FFFFFF', borderRadius: '16px', boxShadow: '0 0 30px var(--paper)' });
    appear(ring, T('c2') + 0.7); gone.push(ring);
    const val13 = el(world, tx13 - 170, 764, 340, 52, { textAlign: 'center', font: '700 40px/1 "Inter", "Sans SC"' }, valueOfCode(13).toFixed(6));
    appear(val13, T('c2') + 0.8); gone.push(val13);
    sfx('chime', T('c2') + 0.2, { g: 0.6 });

    // c3：每个数都偏了一点：32 个数各在色带上，偏的那一小段用白线标出来
    const hideC2 = [...gone];
    hideC2.forEach((e) => hide(e, T('c3') - 0.05, { d: 0.25, y: 0 }));
    const band2 = el(world, BX, BY, BW, BH, { background: grad(), borderRadius: '35px', boxShadow: '0 0 48px #A855F7' });
    wipe(band2, T('c3') - 0.05, { dir: 'l', d: 0.4 }); gone.push(band2);
    const svgB = svg('svg', { class: 'ov', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world); gone.push(svgB);
    G.values.forEach((v, i) => {
      const cx = X(v), cy = 419 + (i % 3) * 20, cxq = X(valueOfCode(G.codes[i]));
      const d = dotOf(i); appear(d, T('c3') + 0.2 + i * 0.02); gone.push(d);
      const p = svg('path', { d: `M${cx},${cy} L${cxq},${cy}`, stroke: '#FFFFFF', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 }, svgB);
      draw(p, T('c3') + 0.6 + i * 0.02, 0.4);
    });
    const avg = el(world, 144, 780, 1400, 60, {}, '平均偏差 0.00068，平均每个数 0.00829', 'lbl-m');
    wipe(avg, T('c3') + 1.5, { dir: 'l', d: 0.5 });
    sfx('tick', T('c3') + 1.5, { g: 0.6 });

    // c4：4 位的每 100 个词约 5 个不一样。原版一行，4 位一行，不一样的亮起来
    const hideC3 = [...gone];
    hideC3.forEach((e) => hide(e, T('c4') - 0.05, { d: 0.25, y: 0 }));
    const N = 100, PITCH = 16, X0 = 160, DIFF = Math.round(100 - D.files[2].agree);
    const lit = new Set(Array.from({ length: DIFF }, (_, k) => Math.floor((k + 0.5) * N / DIFF)));
    const row1Lab = el(world, 160, 250, 400, 40, {}, '原版', 'lbl');
    appear(row1Lab, T('c4') + 0.1); gone.push(row1Lab);
    const row1 = el(world, 0, 0, 1920, VH, {}, '', '');
    for (let i = 0; i < N; i++) el(row1, X0 + i * PITCH, 296, 10, 64, { background: ramp(0.6), borderRadius: '5px' });
    appear(row1, T('c4') + 0.2); gone.push(row1);
    const cnt = el(world, 1054, 150, 530, 100, { textAlign: 'right' }, `0 / ${N}`, 'num');
    countTo(cnt, 0, DIFF, T('c4') + 0.6, 1.2, (v) => `${Math.round(v)} / ${N}`);
    appear(cnt, T('c4') + 0.6); gone.push(cnt);
    const cntLab = el(world, 1054, 254, 530, 40, { textAlign: 'right' }, '个词和原版不一样', 'lbl');
    wipe(cntLab, T('c4') + 0.9, { dir: 'l', d: 0.4 }); gone.push(cntLab);
    sfx('tick', T('c4') + 0.6, { g: 0.6 });

    // c5：它每个词都接着前面的说：第二行从左到右写出来，不一样的那几格亮起来
    const row2Lab = el(world, 160, 378, 320, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 34px/60px "Sans SC", "Inter"' }, '4 位 · Q4_K_M');
    appear(row2Lab, T('c4') + 1.8); gone.push(row2Lab);
    const xs = [];
    const row2 = el(world, 0, 0, 1920, VH, {}, '', '');
    for (let i = 0; i < N; i++) {
      const x = X0 + i * PITCH;
      if (lit.has(i)) {
        el(row2, x - 1, 446, 12, 84, { background: '#FFFFFF', borderRadius: '6px', boxShadow: '0 0 18px #fff' });
        xs.push(x + 5);
      } else {
        el(row2, x, 456, 10, 64, { background: ramp(0.6), borderRadius: '5px' });
      }
    }
    wipe(row2, T('c5') + 0.1, { dir: 'l', d: 0.1 });
    sfx('pop', T('c5') + 0.5, { g: 0.5 });

    // c6：岔开以后越走越偏。原版是一条直线，4 位的那条在每个不一样的词上再偏一点
    const y0 = 640, xEnd = X0 + (N - 1) * PITCH + 10;
    const base = svg('svg', { class: 'ov', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world);
    const line0 = svg('path', { d: `M${X0},${y0} L${xEnd},${y0}`, stroke: ramp(0.6), 'stroke-width': 14, 'stroke-linecap': 'round', fill: 'none' }, base);
    appear(line0, T('c6'));
    let y = y0, px0 = xs[0], d = `M${X0},${y0} L${xs[0]},${y0}`;
    const pts = [];
    xs.forEach((x, k) => {
      if (k) y += (x - px0) * 0.04 * k;
      px0 = x; d += ` L${x},${y.toFixed(1)}`; pts.push([x, y]);
    });
    y += (xEnd - px0) * 0.04 * xs.length;
    d += ` L${xEnd},${y.toFixed(1)}`;
    const path = svg('path', { d, stroke: '#FFFFFF', 'stroke-width': 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', fill: 'none' }, base);
    appear(path, T('c6') + 0.3);
    pts.forEach(([x, py], k) => {
      const g = svg('path', { d: `M${x},536 L${x},${py.toFixed(1)}`, stroke: '#FFFFFF', 'stroke-width': 1.5, opacity: 0.35, fill: 'none' }, base);
      draw(g, T('c6') + 0.3 + k * 0.2, 0.4);
      const dot = el(world, x - 7, py - 7, 14, 14, { background: '#FFFFFF', borderRadius: '50%' });
      appear(dot, T('c6') + 0.5 + k * 0.2);
    });
    const endLab = el(world, xEnd - 280, y0 - 84, 260, 68, { background: '#FFFFFF', color: '#0D0620', borderRadius: '28px', textAlign: 'center', lineHeight: '56px', font: '700 34px/56px "Sans SC", "Inter"' }, '原版');
    appear(endLab, T('c6') + 0.2);
    const fourLab = el(world, xEnd - 280, y + 12, 260, 68, { background: '#FFFFFF', color: '#0D0620', borderRadius: '28px', textAlign: 'center', lineHeight: '56px', font: '700 34px/56px "Sans SC", "Inter"' }, '4 位');
    appear(fourLab, T('c6') + 1.6);
    sfx('whoosh', T('c6'), { g: 0.5 });
  });
})();
