// 五个版本做同一份卷子（t1–t9）：体积与分数的表。每一行：体积（紫色的色带越短越粗）、答对（白线上的点）。
// 少想（竖线）与多想（圆点）两个分数：1 位档少想能对一成半，想久了反而降到一成。4 位在 89 个多步任务上与原版打平。
// 指认用随旁白平滑滑动的行选区（F29），不用一个框在文字之间跳；字幕说过的话画面不再写一遍（F25）。
// 数据：data.js 的 files（体积、分数、少想 low、一致率）与 tasks。
(function () {
  const { el, grad, bands, files, D } = QZ;
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
    const hdrAns = el(world, AX, 136, 700, 40, {}, '198 道选择题 · 答对', 'hit');
    appear(hdrAns, T('t2')); rowEls.push(hdrAns);
    // 198 道题用一条带表示，不画 198 根看不见的细刺
    const strip = el(world, AX, 176, 680, 12, { background: '#8A7BB5', borderRadius: '6px' });
    strip.dataset.name = '题量带';
    wipe(strip, T('t1') + 1.5, { dir: 'l', d: 0.6 }); rowEls.push(strip);
    // 分数轴：各行的分数条都从这条基线长出来，先于分数到位
    const axis = el(world, AX, ROW(4) + 66, 100 * K, 3, { background: '#8A7BB5' });
    axis.dataset.name = '分数轴';
    appear(axis, T('t1') + 2.3); rowEls.push(axis);
    // 四选一：四个选项点，把「四选一」画出来（t2）
    for (let i = 0; i < 4; i++) {
      const od = el(world, AX + i * 26, 158, 12, 12, { background: '#CDBDFF', borderRadius: '50%' });
      od.dataset.name = '选项';
      appear(od, T('t2') + 0.6 + i * 0.08); rowEls.push(od);
    }

    // 行选区：一块淡紫底，随旁白平滑滑到正在讲的那一行（显式起点链，任意 seek 一致）
    const hl = el(world, 110, ROW(0) - 14, 1700, 130, { background: 'rgba(91,33,214,0.30)', borderRadius: '16px' });
    hl.dataset.name = '行选区';
    world.insertBefore(hl, world.firstChild);
    appear(hl, T('t1') + 0.4); rowEls.push(hl);
    let prevTop = ROW(0) - 14;
    for (const [t, row] of [[T('t4'), ROW(1)], [T('t4') + 2.2, ROW(2)], [T('t5'), ROW(3)], [T('t6'), ROW(4)]]) {
      fromTo(hl, t, { top: prevTop }, { top: row - 14, duration: 0.35, ease: 'power2.inOut', immediateRender: false });
      prevTop = row - 14;
    }
    // 每句开始时行选区做一次高亮脉冲（大面积换色，像素级静止检查可见），把「正在讲这一行」点出来
    for (const t of [T('t2'), T('t3'), T('t4'), T('t5'), T('t6'), T('t7'), T('t8'), T('t8') + 1.6]) {
      fromTo(hl, t, { backgroundColor: 'rgba(91,33,214,0.30)' }, { backgroundColor: 'rgba(168,85,247,0.45)', duration: 0.25, ease: 'power2.out', immediateRender: false });
      fromTo(hl, t + 0.25, { backgroundColor: 'rgba(168,85,247,0.45)' }, { backgroundColor: 'rgba(91,33,214,0.30)', duration: 0.4, ease: 'power2.inOut', immediateRender: false });
    }

    // 五行
    files.forEach((r, i) => {
      const y = ROW(i), bad = r.score < 25, col = bad ? '#FF6BB5' : '#FFFFFF';
      const tier = el(world, 120, y + 2, 280, 56, { font: '700 46px/1 "Sans SC", "Inter"' }, TIER[i]);
      wipe(tier, T('t1') + 0.2 + i * 0.12, { dir: 'l', d: 0.4 }); rowEls.push(tier);
      const nm = el(world, 120, y + 60, 290, 32, {}, NAMES[i], 'lbl-m');
      wipe(nm, T('t1') + 0.2 + i * 0.12, { dir: 'l', d: 0.4 }); rowEls.push(nm);
      const vol = el(world, 420, y + 6, r.gb * GB, 60, { background: r.levels >= 256 ? grad() : bands(r.levels) }, '', 'band-obj');
      vol.dataset.name = '体积带';
      wipe(vol, T('t1') + 0.3 + i * 0.8, { dir: 'l', d: 0.6 }); rowEls.push(vol);
      const volLab = el(world, 420 + r.gb * GB + 18, y + 10, 220, 52, {}, `${r.gb} GB`, 'lbl');
      volLab.style.font = '300 40px/1 "Inter", "Sans SC"';
      appear(volLab, T('t1') + 0.6 + i * 0.12); rowEls.push(volLab);

      // 答对：分数条长出来（过程），点与分数随后到位；行的揭示对齐各自的旁白
      const t = [T('t3'), T('t4'), T('t4') + 2.2, T('t5'), T('t6')][i];
      const bar = el(world, AX, y + 15, 0, 36, { background: col, borderRadius: '18px' });
      bar.dataset.name = '分数条';
      fromTo(bar, t, { width: 0 }, { width: r.score * K, duration: 0.5, ease: 'power2.out', immediateRender: false }); rowEls.push(bar);
      const dot = el(world, xOfScore(r.score) - 12, y + 21, 24, 24, { background: col, borderRadius: '50%' });
      appear(dot, t + 0.45); rowEls.push(dot);
      const pct = el(world, 1500, y + 4, 300, 70, { textAlign: 'right' }, r.score.toFixed(1) + '%', 'num');
      pct.style.color = col;
      appear(pct, t + 0.45); rowEls.push(pct);
      // 分数到位时做一次强调缩放（只动 scale，不动透明度），把「这一档的成绩」点出来
      fromTo(pct, t + 0.5, { scale: 1 }, { keyframes: [{ scale: 1.18, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '100% 50%', immediateRender: false });
      sfx(bad ? 'thud' : 'pop', t + 0.45, { g: bad ? 0.8 : 0.5, p: -0.2 + i * 0.1 });
    });

    // t6：瞎蒙 25%（虚线）
    const guess = el(world, xOfScore(25) - 1, 186, 0, 690, { borderLeft: '2px dashed #CDBDFF' });
    guess.dataset.name = '瞎蒙线';
    appear(guess, T('t6')); rowEls.push(guess);
    const guessLab = el(world, xOfScore(25) - 110, 884, 220, 40, { textAlign: 'center' }, '瞎蒙 25%', 'lbl');
    appear(guessLab, T('t6') + 0.3); rowEls.push(guessLab);

    // t7：1 位档少想（15.7%）：一根竖线，标签挨着它
    const lowY = ROW(4), low = files[4].low;
    const tick = el(world, xOfScore(low) - 2, lowY + 18, 4, 48, { background: '#FFFFFF' });
    tick.dataset.name = '少想刻度';
    appear(tick, T('t7')); rowEls.push(tick);
    const lowLab = el(world, xOfScore(low) - 260, lowY + 70, 240, 36, { textAlign: 'center' }, `少想 ${low}%`, 'hit');
    appear(lowLab, T('t7') + 0.3); rowEls.push(lowLab);
    const duoLab = el(world, xOfScore(files[4].score) + 30, lowY + 70, 240, 36, { textAlign: 'center', color: '#FF6BB5' }, `多想 ${files[4].score}%`, 'hit');
    appear(duoLab, T('t8') + 1.6); rowEls.push(duoLab);
    const info = el(world, 120, 884, 900, 40, {}, `1 位档实际平均约 1.8 位 · 与原版逐词一致 ${files[4].agree}%`, 'lbl');
    appear(info, T('t6') + 1.3); rowEls.push(info);
    // t8：想久了反而退步——一个粉点从少想 15.7% 滑回多想 10.4%，把「越想越差」画成过程（粉色只给 1 位档）
    const travel = el(world, xOfScore(low) - 10, lowY + 23, 20, 20, { background: '#FF6BB5', borderRadius: '50%' });
    travel.dataset.name = '退步标记';
    appear(travel, T('t8')); rowEls.push(travel);
    fromTo(travel, T('t8') + 0.2, { left: xOfScore(low) - 10 }, { left: xOfScore(files[4].score) - 10, duration: 1.6, ease: 'power2.inOut', immediateRender: false });
    sfx('blip', T('t7') + 0.3, { g: 0.4 }); sfx('error', T('t8') + 0.2, { g: 0.4 }); sfx('tick', T('t2'), { g: 0.4 }); sfx('whoosh', T('t1') - 0.2, { g: 0.4 });

    // t9：89 个多步编程任务：4 位与原版做对的数一样多（约 63 个）。换成两行小方格
    rowEls.slice().forEach((e) => hide(e, T('t9') - 0.05, { d: 0.35, y: 0 }));
    const tasks = D.tasks, N = tasks.total;
    const tA = el(world, 160, 196, 1400, 40, {}, `${N} 个多步的编程任务`, 'lbl');
    appear(tA, T('t9') + 0.2);
    const rowsOf = [{ y: 330, n: tasks.bf16, lab: '原版 BF16' }, { y: 520, n: tasks.q4, lab: '4 位 Q4_K_M' }];
    rowsOf.forEach((rw, j) => {
      const lab = el(world, 160, rw.y - 58, 700, 40, {}, `${rw.lab} · 约 ${rw.n} 个做对`, 'lbl-m');
      appear(lab, T('t9') + 0.4 + j * 1.2);
      for (let i = 0; i < N; i++) {
        const on = i < rw.n;
        const c = el(world, 160 + i * 17.6, rw.y, 13, 56, on ? { background: '#FFFFFF', borderRadius: '4px' } : { border: '2px solid #8A7BB5', borderRadius: '4px', boxSizing: 'border-box' });
        appear(c, T('t9') + 0.5 + j * 1.2 + i * 0.012);
      }
    });
    const srcT = el(world, 160, 640, 1400, 36, {}, 'Terminal-Bench 2.1 · 来源：Quesma（2026-08）', 'src');
    wipe(srcT, T('t9') + 2.6, { dir: 'l', d: 0.3 });
    sfx('chime', T('t9') + 2.4, { g: 0.6 }); sfx('blip', T('t9') + 0.2, { g: 0.4 });
  });
})();
