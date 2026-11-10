// 五个版本做同一份卷子（t1–t9）：体积与分数的表。每一行：体积（紫色的色带越短越粗）、答对（白线上的点）。
// 少想（竖线）与多想（圆点）两个分数：1 位档少想能对一成半，想久了反而降到一成。4 位在 89 个多步任务上与原版打平。
// 数据：data.js 的 files（体积、分数、少想 low、一致率）与 tasks。
(function () {
  const { el, ramp, grad, bands, files, D } = QZ;
  scene('test', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);
    const TIER = ['原版', '8 位', '4 位', '2 位', '1 位'];
    const NAMES = ['BF16', 'Q8_0', 'Q4_K_M', 'UD-Q2_K_XL', 'UD-IQ1_S'];
    const AX = 1120, K = 3.6, GB = 9.5, ROW = (i) => 196 + i * 142;
    const rowEls = [];
    const xOfScore = (s) => AX + s * K;

    // 表头
    const hdr = el(world, 120, 92, 900, 40, {}, 'Qwen3.8 27B · 五个版本', 'lbl-m');
    wipe(hdr, T('t1'), { dir: 'l', d: 0.4 }); rowEls.push(hdr);
    const hdrVol = el(world, 420, 136, 400, 40, {}, '体积', 'lbl');
    wipe(hdrVol, T('t1'), { dir: 'l', d: 0.4 }); rowEls.push(hdrVol);
    const hdrAns = el(world, AX, 136, 700, 40, {}, '198 道选择题 · 答对', 'lbl');
    appear(hdrAns, T('t1') + 2.4); rowEls.push(hdrAns);

    // t2：198 道题，每题一格
    for (let i = 0; i < 198; i++) {
      const x = AX + i * (680 / 198);
      const q = el(world, x, 176, 2, 12, { background: '#CDBDFF' });
      appear(q, T('t1') + 1.5 + i * 0.007); rowEls.push(q);
    }
    const strip = el(world, AX, 176, 680, 12, { background: '#8A7BB5' });
    wipe(strip, T('t1') + 1.5, { dir: 'l', d: 0.6 }); rowEls.push(strip);

    // 五行
    files.forEach((r, i) => {
      const y = ROW(i), bad = r.score < 25, col = bad ? '#FF6BB5' : '#FFFFFF';
      const tier = el(world, 120, y + 2, 280, 56, { font: '700 46px/1 "Sans SC", "Inter"' }, TIER[i]);
      wipe(tier, T('t1') + 0.2 + i * 0.12, { dir: 'l', d: 0.4 }); rowEls.push(tier);
      const nm = el(world, 120, y + 60, 290, 32, {}, NAMES[i], 'lbl-m');
      wipe(nm, T('t1') + 0.2 + i * 0.12, { dir: 'l', d: 0.4 }); rowEls.push(nm);
      const vol = el(world, 420, y + 6, r.gb * GB, 60, { background: r.levels >= 256 ? grad() : bands(r.levels), borderRadius: '30px', boxShadow: '0 0 36px #A855F7' });
      wipe(vol, T('t1') + 0.3 + i * 0.12, { dir: 'l', d: 0.6 }); rowEls.push(vol);
      const volLab = el(world, 420 + r.gb * GB + 18, y + 10, 220, 52, {}, `${r.gb} GB`, 'lbl');
      volLab.style.font = '300 40px/1 "Inter", "Sans SC"';
      appear(volLab, T('t1') + 0.6 + i * 0.12); rowEls.push(volLab);

      // 答对：白线、点与分数，按行出现
      const t = [T('t2') + 1.6, T('t4'), T('t4') + 2.2, T('t5'), T('t6')][i];
      const bar = el(world, AX, y + 15, r.score * K, 36, { background: col, borderRadius: '18px' });
      appear(bar, t); rowEls.push(bar);
      const dot = el(world, xOfScore(r.score) - 12, y + 21, 24, 24, { background: col, borderRadius: '50%', boxShadow: '0 0 16px ' + col });
      appear(dot, t + 0.45); rowEls.push(dot);
      const pct = el(world, 1500, y + 4, 300, 70, { textAlign: 'right' }, r.score.toFixed(1) + '%', 'num');
      pct.style.color = col;
      appear(pct, t + 0.45); rowEls.push(pct);
      sfx(bad ? 'thud' : 'pop', t + 0.45, { g: bad ? 0.8 : 0.5, p: -0.2 + i * 0.1 });
    });

    // t6：瞎蒙 25%（虚线）
    const guess = el(world, xOfScore(25) - 1, 186, 0, 690, { borderLeft: '2px dashed #CDBDFF' });
    appear(guess, T('t6')); rowEls.push(guess);
    const guessLab = el(world, xOfScore(25) - 100, 884, 220, 40, { textAlign: 'center' }, '瞎蒙 25%', 'lbl');
    appear(guessLab, T('t6') + 0.3); rowEls.push(guessLab);

    // t7：1 位档少想（15.7%）：一根竖线
    const lowY = ROW(4);
    const low = files[4].low;
    const tick = el(world, xOfScore(low) - 2, lowY + 18, 4, 48, { background: '#FFFFFF' });
    appear(tick, T('t7')); rowEls.push(tick);
    const lowLab = el(world, xOfScore(25) + 22, lowY + 22, 360, 40, {}, `少想 ${low}%`, 'lbl-m');
    appear(lowLab, T('t7') + 0.3); rowEls.push(lowLab);

    // t8：想久了，反而降到 10.4%：指向圆点的一句话
    const back = el(world, xOfScore(25) + 22, 812, 560, 40, {}, '想久了，常常交白卷', 'lbl');
    back.style.color = '#FFE3FF';
    wipe(back, T('t8'), { dir: 'l', d: 0.4 }); rowEls.push(back);

    // 高亮框：一块半透明的底，圈住正在讲的那一行。它的移动与伸缩让画面每两三秒就有一处变化
    const hl = el(world, 110, ROW(0) - 14, 1700, 130, { background: '#5B21D6', borderRadius: '22px' });
    appear(hl, T('t1') + 0.4); rowEls.push(hl); world.insertBefore(hl, world.firstChild);
    set(hl, T('t1') + 2.0, { height: 176 });
    set(hl, T('t2'), { height: 130 });
    set(hl, T('t3'), { height: 176 });
    set(hl, T('t3') + 1.2, { top: ROW(1) - 14 });
    set(hl, T('t4') + 2.2, { top: ROW(2) - 14 });
    set(hl, T('t5'), { top: ROW(3) - 14 });
    set(hl, T('t6'), { top: ROW(4) - 14 });
    set(hl, T('t6') + 1.2, { height: 130 });
    set(hl, T('t7'), { height: 176 });
    set(hl, T('t8'), { height: 130 });
    set(hl, T('t8') + 1.2, { height: 176 });
    const info = el(world, 120, 884, 1000, 40, {}, `1 位档实际平均约 1.8 位，与原版逐词一致 ${files[4].agree}%`, 'lbl');
    appear(info, T('t6') + 1.3); rowEls.push(info);
    sfx('blip', T('t7') + 0.3, { g: 0.4 }); sfx('blip', T('t8'), { g: 0.4 });

    // t9：89 个多步编程任务：4 位与原版做对的数一样多（约 63 个）。换成两行小方格
    const hideAll = rowEls.slice();
    hideAll.forEach((e) => hide(e, T('t9') - 0.05, { d: 0.35, y: 0 }));
    const tasks = D.tasks, N = tasks.total;
    const tA = el(world, 160, 196, 1400, 40, {}, `${N} 个多步的编程任务，原版做对约 ${tasks.bf16} 个`, 'lbl');
    appear(tA, T('t9') + 0.2);
    const rowsOf = [{ y: 330, n: tasks.bf16, lab: '原版 BF16' }, { y: 520, n: tasks.q4, lab: '4 位 Q4_K_M' }];
    rowsOf.forEach((rw, j) => {
      const lab = el(world, 160, rw.y - 58, 700, 40, {}, `${rw.lab} · 约 ${rw.n} 个做对`, 'lbl-m');
      appear(lab, T('t9') + 0.4 + j * 1.2);
      for (let i = 0; i < N; i++) {
        const on = i < rw.n;
        const c = el(world, 160 + i * 17.6, rw.y, 13, 56, on ? { background: '#FFFFFF', borderRadius: '4px' } : { border: '2px solid #8A7BB5', borderRadius: '4px', boxSizing: 'border-box' });
        appear(c, T('t9') + 0.5 + j * 1.2 + i * 0.01);
      }
    });
    const srcT = el(world, 160, 640, 1400, 36, {}, 'Terminal-Bench 2.1 · 来源：Quesma（2026-08）', 'lbl-m');
    wipe(srcT, T('t9') + 2.6, { dir: 'l', d: 0.3 });
    sfx('chime', T('t9') + 2.4, { g: 0.6 }); sfx('blip', T('t9') + 0.2, { g: 0.4 });
    sfx('tick', T('t2'), { g: 0.4 });
    sfx('whoosh', T('t1') - 0.2, { g: 0.4 });
  });
})();
