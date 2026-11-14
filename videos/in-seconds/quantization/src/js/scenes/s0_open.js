// 引子：同一个模型的两个文件，一块显卡。55 块砖（原版，每块 1 GB）先占满画面；显卡进来时文件收到左边，
// 前 24 块飞进 24 个槽，剩下 31 块进不去。17 块砖的版本（砖面只剩 16 种紫）分数几乎一样。
// o4 点题：显卡退场，右半边成为片名卡；片名只上画面。片名卡不再退回原画面，整页收走后切到历史。
(function () {
  const { el, tiles, gpu, files } = QZ;
  scene('open', ({ root, s }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);   // 镜头不动：文件与显卡在原地变化
    const tH = L.scenes.find((x) => x.id === 'hist').start;

    // ── 原版：一个容器里放「55 GB」与 55 块砖（11 × 5，砖 72、间距 84）。开场时它居中占满画面 ──
    const P0 = 84, SZ = 72, X0 = 503, Y0 = 236;
    const fa = el(world, X0, Y0, 920, 560, { zIndex: 6, transformOrigin: '0 0' });   // 容器有变换就自成层叠上下文：给它 zIndex，飞出去的砖才压得住显卡
    fa.dataset.name = '原版文件';
    const A = tiles(fa, 55, { x: 0, y: 150, cols: 11, pitch: P0, size: SZ, levels: 65536, seed: 1 });
    // 砖先以暗的样子铺满（文件在那儿），o1b 数到多少 GB，就亮起多少块：一块就是 1 GB
    A.forEach((e, i) => { const col = i % 11, row = Math.floor(i / 11); fromTo(e, 0.05 + col * 0.06 + row * 0.03, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 0.3, scale: 1, duration: 0.45, ease: 'back.out(2)' }); });
    sfx('tick', 0.05, { g: 0.5 }); sfx('tick', 0.45, { g: 0.4 }); sfx('tick', 0.85, { g: 0.35 });
    const gbA = el(fa, -4, 0, 360, 120, {}, '0 GB', 'big');
    const tC0 = T('o1b') + 0.15, tC1 = T('o1b', '五十五') + 0.25, dC = tC1 - tC0;
    wipe(gbA, tC0, { dir: 'l', d: 0.3 });
    countTo(gbA, 0, 55, tC0, dC, (v) => Math.round(v) + ' GB');
    A.forEach((e, i) => { const k = 1 - Math.pow(1 - (i + 1) / 55, 1 / 5); fromTo(e, tC0 + dC * k - 0.05, { opacity: 0.3 }, { opacity: 1, duration: 0.12, immediateRender: false }); });   // countTo 用 out5 缓动：第 i 块在读数到 i+1 时亮
    sfx('blip', tC0 + 0.1, { g: 0.45 }); sfx('blip', T('o1b', '五十五'), { g: 0.6 });
    // 图例放在容器里，跟着文件一起收到左边；字号按缩小后仍有 29px 定
    const legA = el(fa, 0, 150 + 5 * P0 + 10, 900, 60, { fontSize: '44px' }, '55 块，每块 1 GB', 'lbl');
    appear(legA, tC0 + 0.2);

    // 显卡进来之前，文件从居中收到左边、缩成 2/3（砖 48、间距 56），给显卡让位
    const s2 = 56 / P0, X1 = 120, Y1 = 214, tMove = T('o2') - 0.35;
    fromTo(legA, T('o3') - 0.1, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false });   // 17 GB 那一排进来之前收走，给它让位
    fromTo(fa, tMove, { x: 0, y: 0, scale: 1 }, { x: X1 - X0, y: Y1 - Y0, scale: s2, duration: 0.6, ease: 'power3.inOut' });

    const name = el(world, 120, 124, 900, 80, {}, 'Qwen3.8 27B', 'h1');
    wipe(name, T('o1', 'Qwen'), { dir: 'l', d: 0.5 }); sfx('thud', T('o1', 'Qwen'), { g: 0.6 });

    // ── o2：显卡从右边进来，24 个槽；前 24 块砖飞进去，剩下 31 块进不去 ──
    const G = gpu(world, 1000, 300);
    slide(G.root, T('o2') - 0.1, { x: 340, d: 0.7, ease: 'power3.out' }); sfx('whoosh', T('o2') - 0.3, { g: 0.6 });
    const tFly = T('o2', '显卡') + 0.05;
    A.slice(0, 24).forEach((e, i) => {
      // 容器缩放之后，砖在画面上的位置 = 容器位置 + 缩放 × 砖在容器里的位置；位移写在容器的坐标里
      const dx = (G.slots[i].x - X1) / s2 - e._x, dy = (G.slots[i].y - Y1) / s2 - e._y, t0 = tFly + i * 0.03;
      fromTo(e, t0, { x: 0, y: 0 }, { x: dx, y: dy, duration: 0.55, ease: 'power2.inOut', immediateRender: false });
      // 不退回：显卡满着，一直到 o4 显卡带着这 24 块一起退场
      fromTo(e, T('o4') - 0.05, { x: dx, opacity: 1 }, { x: dx + 300 / s2, opacity: 0, duration: 0.5, ease: 'power2.in', immediateRender: false });
    });
    sfx('blip', tFly + 0.3, { g: 0.5 }); sfx('pop', tFly + 0.55 + 23 * 0.03, { g: 0.6 });
    const tNo = Math.max(T('o2', '装不下'), tFly + 23 * 0.03 + 0.65);   // 24 个槽全满之后，剩下的才「进不去」
    A.slice(24).forEach((e, i) => {
      fromTo(e, tNo + (i % 11) * 0.01, { x: 0 }, { keyframes: [{ x: -12, duration: 0.07 }, { x: 11, duration: 0.08 }, { x: -8, duration: 0.08 }, { x: 5, duration: 0.08 }, { x: 0, duration: 0.1 }], immediateRender: false });
      fromTo(e, tNo + 0.3, { opacity: 1 }, { opacity: 0.35, duration: 0.3, immediateRender: false });   // 计数时已亮到 1；之后一直暗着：它们没装进去
    });
    sfx('thud', tNo, { g: 0.8 });
    const short = el(G.root, 286, 30, 450, 60, { textAlign: 'right' }, '还差 31 GB', 'mid');
    appear(short, tNo + 0.1);

    // ── o3：另一个版本，17 块砖，砖面只剩 16 种紫（色阶看得见）；两个分数 ──
    const tB = T('o3', '十七') - 0.15;
    const gbB = el(world, 116, 650, 360, 90, {}, '0 GB', 'num');
    wipe(gbB, tB, { dir: 'l', d: 0.3 });
    countTo(gbB, 0, 17, tB, 0.7, (v) => Math.round(v) + ' GB');
    const B = tiles(world, 17, { x: 120, y: 754, cols: 11, pitch: 56, size: 48, levels: 16, seed: 2 });
    B.forEach((e, i) => fromTo(e, tB + 0.1 + i * 0.035, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }));
    sfx('pop', tB + 0.1, { g: 0.5, p: -0.3 });
    const legB = el(world, 420, 674, 320, 44, {}, '另一个版本', 'lbl');
    slide(legB, tB + 0.4, { x: -30, d: 0.45 });
    const tS = T('o3', '分数') - 0.1;
    const scA = el(world, 488, 212, 240, 90, { textAlign: 'right' }, files[0].score.toFixed(1) + '%', 'num');
    const scB = el(world, 488, 650, 240, 90, { textAlign: 'right' }, files[2].score.toFixed(1) + '%', 'num');
    const okA = el(world, 744, 252, 200, 40, {}, '做题答对', 'lbl-s'), okB = el(world, 744, 690, 200, 40, {}, '做题答对', 'lbl-s');
    wipe(scA, tS, { dir: 'r', d: 0.35 }); wipe(scB, tS + 0.25, { dir: 'r', d: 0.35 });
    appear(okA, tS + 0.3); appear(okB, tS + 0.55);
    sfx('tick', tS, { g: 0.7 }); sfx('tick', tS + 0.25, { g: 0.7 });
    exit(legB, tS + 0.2, { x: -10, d: 0.2 });

    // ── o4：显卡退场，右半边成为片名卡（片名只上画面） ──
    const tQ = T('o4', '量化');
    exit(G.root, T('o4') - 0.05, { x: 300, d: 0.5 });
    const leftA = [name, fa, scA, okA], leftB = [scB, okB, gbB, ...B];
    fromTo([...leftA, ...leftB], T('o4') + 0.2, { opacity: 1 }, { opacity: 0.22, duration: 0.5, immediateRender: false });
    // 片名落下后，17 GB 那一排（量化过的）重新亮起：片名讲的「让模型变小的办法」就是它
    fromTo(leftB, tQ + 0.55, { opacity: 0.22 }, { opacity: 1, duration: 0.1, immediateRender: false }); sfx('blip', tQ + 0.55, { g: 0.5 });
    // 片名卡：「120 秒了解」小字在上，「量化」两个字最大，副题在下；片名只上画面（策划者 r3：「开场封面 量化 两个字太小」）
    const ta = el(world, 1004, 214, 820, 50, {}, '120 秒了解', 'title-a');
    const tq = el(world, 984, 270, 860, 280, { font: '900 260px/1 "Sans SC"', letterSpacing: '-6px' }, '量化');
    tq.dataset.gloss = '量化';
    const tb = el(world, 1000, 572, 860, 80, { font: '800 64px/1.1 "Sans SC"', color: 'var(--paper)' }, '让模型变小的方式和代价');
    const gl = el(world, 1004, 676, 820, 50, { fontSize: '34px' }, 'Quantization', 'mlbl');
    const tT = T('o4', '变小') - 0.1;
    wipe(ta, T('o4') + 0.3, { dir: 'l', d: 0.4 });
    wipe(tb, tT, { dir: 'l', d: 0.45 }); sfx('riser', tQ - 0.9, { g: 0.5 }); sfx('tick', tT, { g: 0.6 });
    slam(tq, tQ - 0.05, { from: 1.25, d: 0.45 }); sfx('thud', tQ - 0.05, { g: 0.9 });
    appear(gl, tQ + 0.35);
    // 切到历史之前，整页朝左收走，切点上画面已经空了，不会出现「片名之后又回到原画面」
    [ta, tq, tb, gl].forEach((e, i) => wipeOut(e, tH - 0.45 + i * 0.04, { dir: 'l', d: 0.35 }));
    fromTo(leftA, tH - 0.45, { opacity: 0.22 }, { opacity: 0, duration: 0.3, immediateRender: false });
    fromTo(leftB, tH - 0.45, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false });
    sfx('whoosh', tH - 0.4, { g: 0.6 });
  });
})();
