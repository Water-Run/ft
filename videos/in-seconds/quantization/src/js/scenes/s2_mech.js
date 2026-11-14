// 机制：what → how → cost 三场是一个连续的画面（config.js 的 GROUPS），对象一直在场、原地变化（经验规则 F29）。
//   what：55 块砖里的一块放大，是一片数；其中一行是文件里真实的 32 个数（blk.13.ffn_down.weight 第 1000 组，FACTS B4）；
//         一个数拎出来，是 16 个 0 或 1；278 亿 × 16 位 ≈ 55 GB。
//   how ：那一行升到上方，32 个数落到一条数轴上；每组定 16 个等间距的值（数轴上的 16 道刻线，各配一种 4 位的排法）；
//         每个数滑到最近的刻线，上方那一行改记「第几个」；这一组 512 位 → 144 位。
//   cost：放大镜看第 2、3、14、23 号：四个不同的数落到同一道刻线（FACTS B5）；32 个数个个偏了一点（B6）；
//         落到说话上，两行各 100 个词，4 位的那行有 5 个不一样（E13，位置是示意）；每个词接着前面的说，岔开以后越走越偏（E17，示意）。
(function () {
  const { el, G, ramp, uOf, xOf, bits16, bits4, valueOfCode, tiles, texURL } = QZ;
  // how、cost 两场画在 what 的画面里（config.js 的 GROUPS），它们自己的根节点是空的
  scene('how', () => {}); scene('cost', () => {});
  scene('what', ({ root, s }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);   // 镜头不动：这一章是一个原地变化的画面
    const S = Object.fromEntries(L.scenes.map((x) => [x.id, x]));
    const tTest = S.test.start;
    const V = G.values, CODE = G.codes, DEC = G.decoded, N = V.length;

    // ════ what ════
    // 55 块砖（与开场同一套种子），一块放大成一片数
    const grid = tiles(world, 55, { x: 656, y: 300, cols: 11, pitch: 56, size: 48, levels: 65536, seed: 1 });
    grid.forEach((e, i) => fromTo(e, s.start + 0.02 + (i % 11) * 0.02, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }));
    const gHead = el(world, 656, 230, 700, 50, {}, 'Qwen3.8 27B · 原版 55 GB', 'mlbl');
    appear(gHead, s.start + 0.05);
    sfx('tick', s.start + 0.05, { g: 0.5 });

    // 那一片数：32 列 × 6 行，第 3 行是真实的 32 个数，其余几行是同一张纹理里的示意
    const PX = 160, PY = 330, CP = 50, CS = 46;
    const panel = el(world, PX, PY, 32 * CP, 6 * CP);
    panel.dataset.name = '一片数';
    const fld = (i, j) => { const r = seeded(9000 + j * 64 + i)(); return 0.5 + 0.22 * Math.sin(i * 0.45 + j * 1.3) * Math.cos(j * 0.8 - i * 0.2) + (r - 0.5) * 0.35; };
    const cells = [];
    for (let j = 0; j < 6; j++) for (let i = 0; i < 32; i++) {
      const u = j === 2 ? uOf(V[i]) : Math.min(0.97, Math.max(0.03, fld(i, j)));
      const c = el(panel, i * CP, j * CP, CS, CS, { background: ramp(u), borderRadius: '6px' });
      if (j === 2) cells.push(c);
    }
    const others = Array.from(panel.children).filter((c) => !cells.includes(c));
    // 放大：选中的砖先放大到那片数的左上角，那片数随即从左到右铺开，其余砖退淡
    const pick = grid[16], tZ = T('a1') + 0.1;
    fromTo(pick, tZ, { x: 0, y: 0, scale: 1 }, { x: PX - pick._x, y: PY - pick._y, scale: 300 / 48, transformOrigin: '0 0', duration: 0.6, ease: 'power3.inOut', immediateRender: false });
    set(pick, tZ + 0.6, { autoAlpha: 0 });
    fromTo(grid.filter((e) => e !== pick), tZ, { opacity: 1 }, { opacity: 0, duration: 0.35, immediateRender: false });
    exit(gHead, tZ, { y: -10, d: 0.3 });
    wipe(panel, tZ + 0.45, { dir: 'l', d: 0.7 }); sfx('whoosh', tZ, { g: 0.5 });

    // 278 亿个
    const cnt = el(world, 156, 150, 900, 120, {}, '0', 'big');
    appear(cnt, T('a1', '二百七十八亿') - 0.15);
    countTo(cnt, 0, QZ.D.params, T('a1', '二百七十八亿') - 0.15, 1.1, (v) => Math.round(v).toLocaleString('en-US').replace(/,/g, ' '));
    sfx('blip', T('a1', '二百七十八亿'), { g: 0.6 });
    const cntL = el(world, 162, 276, 700, 44, {}, '个数', 'lbl');
    appear(cntL, T('a1', '二百七十八亿') + 0.9);
    // 这一片是从那块砖里放大出来的一角：每一格是一个数，颜色深浅是它的大小
    const cellL = el(world, PX + 32 * CP - 600, PY - 50, 594, 40, { textAlign: 'right' }, '放大一块砖 · 每格一个数', 'lbl');
    appear(cellL, tZ + 0.9);

    // a3：那一行框出来，其余几行退淡；第 3 个数（0.013428）拎出来，16 个 0 或 1
    const tR = T('a3') - 0.05;
    fromTo(others, tR, { opacity: 1 }, { opacity: 0.16, duration: 0.4, immediateRender: false });
    const rowBox = el(world, PX - 8, PY + 2 * CP - 8, 32 * CP + 12, CS + 16, { border: '4px solid var(--paper)', borderRadius: '10px' });
    wipe(rowBox, tR, { dir: 'l', d: 0.45 }); sfx('tick', tR, { g: 0.6 });
    const groupL = el(world, PX, PY + 6 * CP + 14, 1200, 40, {}, '文件里真实的一组 · blk.13.ffn_down.weight 第 1000 组 · 32 个数', 'mlbl-s');
    appear(groupL, tR + 0.3);
    const ONE = 2, BY = 720;
    const one = el(world, 160, BY, 112, 112, { background: ramp(uOf(V[ONE])), borderRadius: '10px' });
    one.dataset.name = '一个数';
    const c1 = cells[ONE];
    fromTo(one, T('a3', '每个数'), { autoAlpha: 0, x: PX + ONE * CP - 160, y: PY + 2 * CP - BY, scale: CS / 112, transformOrigin: '0 0' }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
    sfx('pop', T('a3', '每个数'), { g: 0.6 });
    const oneV = el(world, 300, BY - 8, 400, 64, {}, V[ONE].toFixed(6), 'mid');
    appear(oneV, T('a3', '每个数') + 0.4);
    const oneMark = el(world, PX + ONE * CP - 6, PY + 2 * CP - 6, CS + 12, CS + 12, { border: '4px solid var(--paper)', borderRadius: '9px', zIndex: 3 });
    appear(oneMark, T('a3', '每个数') - 0.05);
    const B16 = bits16(V[ONE]), bitEls = [];
    for (let k = 0; k < 16; k++) {
      const one1 = B16[k] === '1';
      const b = el(world, 300 + k * 66, BY + 70, 54, 54, { textAlign: 'center', font: '700 32px/46px "Mono"', color: one1 ? 'var(--ink)' : 'var(--dim)' }, B16[k], 'bitc ' + (one1 ? 'bit1' : 'bit0'));
      bitEls.push(b);
      fromTo(b, T('a3', '十六位') + k * 0.035, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'back.out(2)' });
    }
    sfx('key', T('a3', '十六位'), { g: 0.5 }); sfx('key', T('a3', '十六位') + 0.25, { g: 0.45 }); sfx('key', T('a3', '十六位') + 0.5, { g: 0.4 });
    const b16L = el(world, 1380, BY + 72, 300, 54, {}, '16 位', 'hit');
    wipe(b16L, T('a3', '零或一') - 0.1, { dir: 'l', d: 0.35 });

    // a4：× 16 位 ≈ 55 GB
    const eq = el(world, 1080, 186, 720, 70, {}, '× 16 位', 'mid');
    wipe(eq, T('a3', '零或一') + 0.3, { dir: 'l', d: 0.45 });
    const tEq = T('a4') + 0.1, dEq = Math.max(0.6, T('a4', '五十五') - T('a4') + 0.2);
    let lastEq = null;
    F((t) => { const v = t < tEq ? '× 16 位' : '× 16 位 ≈ ' + Math.round(55 * ease.out5(clamp((t - tEq) / dEq))) + ' GB'; if (v !== lastEq) { eq.textContent = v; lastEq = v; } });
    sfx('tick', T('a4') + 0.1, { g: 0.5 }); sfx('thud', T('a4', '五十五') + 0.2, { g: 0.6 });
    // 「加起来」：退淡的几行一起亮回来——要加的是文件里所有的数
    fromTo(others, T('a4', '加起来') + 0.05, { opacity: 0.16 }, { opacity: 1, duration: 0.08, immediateRender: false });
    // 16 个位从左到右逐个亮一下：这 16 位乘上 278 亿个数
    bitEls.forEach((b, k) => fromTo(b, T('a4') + 0.1 + k * 0.06, { y: 0 }, { keyframes: [{ y: -10, duration: 0.12, ease: 'power2.out' }, { y: 0, duration: 0.2, ease: 'power2.in' }], immediateRender: false }));

    // ════ how ════
    const tH = S.how.start;
    // b2：数一个不少（那一行留着），每个数从 16 位变成 4 个空位；数的个数与算式收走
    const tB2 = T('b2') - 0.05;
    fromTo(others, tB2, { opacity: 1 }, { opacity: 0, duration: 0.35, immediateRender: false });
    [cnt, cntL, eq, cellL].forEach((e) => exit(e, tB2, { y: -14, d: 0.35 }));
    exit(groupL, tB2, { d: 0.25 });
    // 那一行升到上方 y = 190
    const RY = 190, lift = RY - (PY + 2 * CP);
    fromTo(panel, tB2 + 0.2, { y: 0 }, { y: lift, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
    fromTo([rowBox, oneMark], tB2 + 0.2, { y: 0 }, { y: lift, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
    sfx('whoosh', tB2 + 0.2, { g: 0.45 });
    const keep = el(world, PX, RY - 66, 900, 44, {}, '32 个数，一个不少', 'lbl');
    appear(keep, T('b2', '一个不少'));
    const keepK = keyed(keep);   // 同一个标签换几次字：用 keyed，不叠多个 swapAt（后注册的会盖掉前面的）
    // 16 个位收成 4 个空位
    const tShrink = T('b2', '少占');
    bitEls.forEach((b, k) => { if (k >= 4) exit(b, tShrink + (15 - k) * 0.025, { x: -30, d: 0.25 }); });
    const slots4 = [0, 1, 2, 3].map((k) => el(world, 300 + k * 66, BY + 70, 54, 54, { border: '4px dashed var(--paper)', borderRadius: '8px' }));
    bitEls.slice(0, 4).forEach((b) => exit(b, tShrink + 0.35, { d: 0.2 }));
    slots4.forEach((e, k) => appear(e, tShrink + 0.45 + k * 0.05));
    sfx('pop', tShrink + 0.45, { g: 0.5 });
    swapAt(b16L, '16 位', '4 位', tShrink + 0.45);
    fromTo(b16L, tShrink + 0.45, { x: 0 }, { x: 300 + 4 * 66 + 30 - 1380, duration: 0.45, ease: 'power3.inOut', immediateRender: false });

    // 数轴：x = 数的大小。16 道刻线是这一组定下的 16 个值：(编号 − 8) × d
    const AX = 160, AW = 1600, AY = 470;
    const axis = el(world, AX, AY - 2, AW, 4, { background: 'var(--line)' });
    wipe(axis, T('b4') - 0.1, { dir: 'l', d: 0.5 });
    const axL = el(world, AX, AY + 150, 300, 36, {}, '← 小', 'lbl-s'), axR = el(world, AX + AW - 300, AY + 150, 300, 36, { textAlign: 'right' }, '大 →', 'lbl-s');
    appear(axL, T('b4') + 0.3); appear(axR, T('b4') + 0.3);
    const tickX = Array.from({ length: 16 }, (_, c) => xOf(valueOfCode(c), AX, AW));
    // b4：4 个 0 或 1 只排得出 16 种。16 种排法在数轴下方排开，每种配一种紫
    const pats = [];
    for (let c = 0; c < 16; c++) {
      const p = el(world, tickX[c] - 38, AY + 60, 76, 70);
      p.dataset.name = '4 位的排法';
      const bs = bits4(c);
      for (let k = 0; k < 4; k++) el(p, k * 20 - 2, 0, 18, 18, bs[k] === '1' ? { background: 'var(--paper)', borderRadius: '3px' } : { border: '3px solid var(--dimp)', borderRadius: '3px' });
      el(p, 0, 28, 76, 40, { textAlign: 'center' }, String(c), 'mlbl');
      pats.push(p);
      fromTo(p, T('b4', '十六种') - 0.5 + c * 0.05, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)' });
    }
    sfx('key', T('b4', '十六种') - 0.5, { g: 0.5 }); sfx('key', T('b4', '十六种') - 0.1, { g: 0.45 }); sfx('blip', T('b4', '十六种') + 0.3, { g: 0.5 });
    // b5：每组定 16 个值：16 道刻线，颜色就是这个值的紫
    const ticks = tickX.map((x, c) => {
      const tk = el(world, x - 3, AY - 44, 6, 88, { background: ramp(uOf(valueOfCode(c))), borderRadius: '3px' });
      tk.dataset.name = '定下的值';
      fromTo(tk, T('b5', '十六个值') - 0.3 + c * 0.03, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.3, ease: 'power3.out' });
      return tk;
    });
    sfx('tick', T('b5', '十六个值') - 0.3, { g: 0.6 }); sfx('tick', T('b5', '十六个值') + 0.1, { g: 0.5 });
    const v16 = el(world, AX, AY - 110, 700, 44, {}, '这一组的 16 个值，间距相等', 'lbl');
    appear(v16, T('b5', '十六个值') + 0.4);
    // b5：32 个数从那一行落到数轴上
    const tDrop = T('b5') + 0.05, R = 15, dots = [];
    for (let i = 0; i < N; i++) {
      const x = xOf(V[i], AX, AW), w = el(world, x - R, AY - R, 2 * R, 2 * R);
      const d0 = el(w, 0, 0, 2 * R, 2 * R, { background: ramp(uOf(V[i])), border: '3px solid var(--paper)' }, '', 'dot');
      const d1 = el(w, 0, 0, 2 * R, 2 * R, { background: ramp(uOf(DEC[i])), border: '3px solid var(--paper)' }, '', 'dot');
      w._x = x; w._d1 = d1; w.dataset.name = '一个数';
      const cx = PX + i * CP + CS / 2;
      fromTo(w, tDrop + i * 0.025, { autoAlpha: 0, x: cx - x, y: RY + CS / 2 - AY }, { autoAlpha: 1, x: 0, y: 0, duration: 0.6, ease: 'power2.in' });
      fromTo(d1, tDrop, { autoAlpha: 0 }, { autoAlpha: 0, duration: 0.01 });
      dots.push(w);
    }
    sfx('blip', tDrop + 0.55, { g: 0.5 }); sfx('blip', tDrop + 0.9, { g: 0.45 });
    // b6：每个数滑到最近的刻线（颜色换成那道刻线的紫），上方那一行改记第几个
    const tSnap = T('b6') + 0.05;
    dots.forEach((w, i) => {
      const dx = xOf(DEC[i], AX, AW) - w._x;
      fromTo(w, tSnap + i * 0.02, { x: 0 }, { x: dx, duration: 0.45, ease: 'power3.inOut', immediateRender: false });
      fromTo(w._d1, tSnap + i * 0.02 + 0.2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: false });
    });
    sfx('tick', tSnap + 0.2, { g: 0.6 }); sfx('tick', tSnap + 0.5, { g: 0.5 });
    const tCode = T('b6', '四位') - 0.1;
    const codeCells = cells.map((c, i) => {
      const e = el(world, PX + i * CP, RY, CS, CS, { background: ramp(uOf(DEC[i])), borderRadius: '6px', textAlign: 'center', lineHeight: CS + 'px', font: '700 26px/46px "Mono"', color: uOf(DEC[i]) > 0.55 ? 'var(--ink)' : 'var(--paper)' }, String(CODE[i]));
      fromTo(e, tCode + i * 0.02, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' });
      return e;
    });
    sfx('key', tCode, { g: 0.5 }); sfx('key', tCode + 0.3, { g: 0.45 }); sfx('key', tCode + 0.6, { g: 0.4 });
    keepK.at(tCode, { html: '文件里只记编号，每个 4 位' });
    // 那一个数（0.013428）：4 个空位填上 1101，是第 13 个
    const B4 = bits4(CODE[ONE]);
    const fill4 = [0, 1, 2, 3].map((k) => el(world, 300 + k * 66, BY + 70, 54, 54, {}, '', 'bitc ' + (B4[k] === '1' ? 'bit1' : 'bit0')));
    fill4.forEach((e, k) => appear(e, tCode + 0.3 + k * 0.06));
    const no13 = el(world, 300 + 4 * 66 + 130, BY + 72, 400, 54, {}, '= 编号 13', 'hit');
    appear(no13, tCode + 0.6);
    slots4.forEach((e) => vanish(e, tCode + 0.3));

    // b7：这一组 512 位 → 144 位（16 位记下这组的值 + 32 × 4 位），不到三成
    const tB7 = T('b7') - 0.05;
    [one, oneV, no13, ...fill4].forEach((e) => exit(e, tB7 - 0.2, { y: 14, d: 0.3 }));
    exit(oneMark, tB7 - 0.2, { d: 0.25 });
    fromTo(b16L, tB7 - 0.2, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false });   // 它已横移过，exit() 会把 x 复位
    fromTo(pats, tB7 - 0.2, { opacity: 1 }, { opacity: 0.35, duration: 0.3, immediateRender: false });
    const BX = 160, BW = 1100;
    const bar1 = el(world, BX, 720, BW, 44, { background: QZ.grad(), borderRadius: '8px' });
    const bar1L = el(world, BX, 676, 900, 40, {}, '原来：32 × 16 = 512 位', 'lbl');
    const w2 = Math.round(BW * 144 / 512);
    const bar2 = el(world, BX, 830, w2, 44, { borderRadius: '8px', overflow: 'hidden' });
    el(bar2, 0, 0, Math.round(BW * 16 / 512), 44, { background: 'var(--paper)' });
    el(bar2, Math.round(BW * 16 / 512), 0, w2 - Math.round(BW * 16 / 512), 44, { background: 'linear-gradient(90deg,#1A0B5E,#5B21D6,#A855F7,#E879F9)' });
    const bar2L = el(world, BX, 786, 1100, 40, {}, '现在：32 × 4 + 16 = 144 位', 'lbl');
    const bar2N = el(world, BX + w2 + 24, 834, 700, 36, {}, '白色的 16 位：记下这组的 16 个值从哪定', 'lbl-s');
    appear(bar2N, T('b7', '不到') + 0.2);
    wipe(bar1, tB7, { dir: 'l', d: 0.5 }); appear(bar1L, tB7);
    wipe(bar2, T('b7', '不到') - 0.3, { dir: 'l', d: 0.4 }); appear(bar2L, T('b7', '不到') - 0.3);
    sfx('whoosh', tB7, { g: 0.4 }); sfx('pop', T('b7', '不到') - 0.3, { g: 0.6 });
    const pct = el(world, 1360, 700, 420, 140, { font: '200 150px/1 "Inter"', letterSpacing: '-5px', textAlign: 'right' }, '28%');
    slam(pct, T('b7', '三成') - 0.2, { from: 1.25, d: 0.4 }); sfx('thud', T('b7', '三成') - 0.2, { g: 0.7 });
    const pctL = el(world, 1360, 850, 420, 40, { textAlign: 'right' }, 'Q4_0 的做法', 'mlbl-s');
    appear(pctL, T('b7', '三成') + 0.3);
    // 说完停一拍时，「原来」那条里超出「现在」长度的部分压暗：这就是省下的地方（FACTS B3：省 71.9%）
    const saved = el(world, BX + w2, 720, BW - w2, 44, { background: 'var(--ink)', opacity: 0.72, borderRadius: '0 8px 8px 0' });
    const savedL = el(world, BX + w2 + 20, 726, 400, 34, { color: 'var(--paper)', fontSize: '28px' }, '省下 72%', 'lbl');
    set([saved, savedL], 0, { autoAlpha: 0 }); set(saved, Tend('b7') + 0.15, { autoAlpha: 0.72 }); set(savedL, Tend('b7') + 0.25, { autoAlpha: 1 });
    sfx('tick', Tend('b7') + 0.15, { g: 0.5 });

    // ════ cost ════
    const tC = S.cost.start;
    const SAME = G.sameCode;            // [2, 3, 14, 23]
    // 收走算账的条，数轴下方的排法退淡
    [bar1, bar1L, bar2, bar2L, bar2N, pct, pctL, savedL].forEach((e) => exit(e, tC - 0.1, { y: 16, d: 0.3 }));
    fromTo(saved, tC - 0.1, { opacity: 0.72, y: 0 }, { opacity: 0, y: 16, duration: 0.3, ease: 'power2.in', immediateRender: false });
    fromTo(pats, tC - 0.1, { opacity: 0.35 }, { opacity: 0, duration: 0.3, immediateRender: false });
    // 上方那一行里，四个数的格子框出来
    const tC1 = T('c1') - 0.05;
    const sameBox = SAME.map((i) => el(world, PX + i * CP - 6, RY - 6, CS + 12, CS + 12, { border: '4px solid var(--paper)', borderRadius: '9px' }));
    sameBox.forEach((e, k) => appear(e, tC1 + k * 0.08));
    fromTo(rowBox, tC1, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false });
    keepK.at(tC1, { html: '第 3、4、15、24 个数，都记成编号 13' });
    // 放大镜：数轴上 0.0105 到 0.0175 这一段，放大到整宽
    const LV0 = 0.0105, LV1 = 0.0175, LX = 160, LW = 1600, LY = 760;
    const lx = (v) => LX + (v - LV0) / (LV1 - LV0) * LW;
    const brk = el(world, xOf(LV0, AX, AW), AY + 40, xOf(LV1, AX, AW) - xOf(LV0, AX, AW), 18, { borderLeft: '4px solid var(--paper)', borderRight: '4px solid var(--paper)', borderBottom: '4px solid var(--paper)', borderRadius: '0 0 6px 6px' });
    wipe(brk, tC1, { dir: 't', d: 0.3 });
    const lens = el(world, 120, 600, 1680, 300, { background: 'var(--ink2)', borderRadius: '16px' });
    lens.dataset.name = '放大镜';
    wipe(lens, tC1 + 0.15, { dir: 't', d: 0.45 }); sfx('whoosh', tC1 + 0.15, { g: 0.5 });
    // 第 13 道刻线所在的那一条：四个数合一的瞬间亮起，表示「都落进了这一格」
    const band13 = el(world, lx(valueOfCode(13)) - 80, 606, 160, 288, { background: '#5B21D6', borderRadius: '10px' });
    set(band13, 0, { autoAlpha: 0 });
    const lAxis = el(world, LX, LY - 2, LW, 4, { background: 'var(--line)' });
    appear(lAxis, tC1 + 0.5);
    const lTicks = [12, 13, 14].map((c) => {
      const tk = el(world, lx(valueOfCode(c)) - 4, LY - 60, 8, 120, { background: ramp(uOf(valueOfCode(c))), borderRadius: '4px' });
      appear(tk, tC1 + 0.5);
      const lb = el(world, lx(valueOfCode(c)) - 100, LY + 70, 200, 36, { textAlign: 'center', color: 'var(--dim)' }, '编号 ' + c, 'mlbl-s');   // 放大镜底色较亮，字亮一档
      appear(lb, tC1 + 0.5);
      return [tk, lb];
    });
    // 四个数原来的位置：各不相同（数字交错放在上下两排）
    const lr = 20;
    // 四个数的读数排成等距的四栏（按大小先后），各有一根引线落到自己的点上，读数之间不挤
    const order = SAME.map((i) => V[i]).sort((a, b) => a - b);
    const four = SAME.map((i, k) => {
      const x = lx(V[i]), col = order.indexOf(V[i]), lxp = 470 + col * 200;
      const w = el(world, x - lr, LY - lr, 2 * lr, 2 * lr);
      el(w, 0, 0, 2 * lr, 2 * lr, { background: ramp(uOf(V[i])), border: '4px solid var(--paper)' }, '', 'dot');
      const lab = el(world, lxp - 80, LY - 140, 160, 40, { textAlign: 'center' }, V[i].toFixed(6), 'mlbl');
      const ln = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world); px(ln, 0, 0);
      svg('path', { d: `M${lxp},${LY - 96} L${lxp},${LY - 74} L${x},${LY - 30}`, fill: 'none', stroke: '#CDBDFF', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, ln);
      fromTo(w, tC1 + 0.6 + k * 0.12, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' });
      appear(lab, tC1 + 0.7 + k * 0.12); set(ln, 0, { autoAlpha: 0 }); set(ln, tC1 + 0.7 + k * 0.12, { autoAlpha: 1 });
      return { w, lab, ln, x };
    });
    sfx('pop', tC1 + 0.6, { g: 0.5 }); sfx('pop', tC1 + 0.85, { g: 0.45 });
    // c2：都落到第 13 道刻线，换成同一个值
    const tC2 = T('c2', '同一个') - 0.35, x13 = lx(valueOfCode(13));
    four.forEach((f, k) => {
      fromTo(f.w, tC2 + k * 0.06, { x: 0 }, { x: x13 - f.x, duration: 0.5, ease: 'power3.inOut', immediateRender: false });
      exit(f.lab, tC2, { d: 0.2 }); exit(f.ln, tC2, { d: 0.2 });
    });
    sfx('thud', tC2 + 0.5, { g: 0.7 });
    set(band13, tC2 + 0.5, { autoAlpha: 0.6 });
    const v13 = el(world, x13 - 300, LY - 128, 600, 64, { textAlign: 'center' }, '都是 ' + DEC[SAME[0]].toFixed(6), 'mid');
    appear(v13, tC2 + 0.55);
    // 上方那一行的四个格子本来就同色同号（13）：这一点在 b6 时已经发生，这里只是指出来

    // c3：放大镜收起；32 个数原来的位置留一个空心圈，到刻线的那一小段就是偏掉的量
    const tC3 = T('c3') - 0.05;
    [lens, lAxis, v13, brk, ...lTicks.flat(), ...four.map((f) => f.w)].forEach((e) => exit(e, tC3, { y: 12, d: 0.3 }));
    fromTo(band13, tC3, { opacity: 0.6 }, { opacity: 0, duration: 0.3, immediateRender: false });
    sameBox.forEach((e) => exit(e, tC3, { d: 0.25 }));
    keepK.at(tC3 + 0.2, { html: '每个数换成刻线上的值以后，偏掉的量' });
    // 偏差图：每个数一根柱，就在上方那一行它自己的格子正下方；柱高 = 换值前后差了多少（向上 = 变大，向下 = 变小）
    const errs = [], EY = 690, ES = 52000;   // 0.001 → 52 像素
    const base = el(world, PX - 10, EY - 2, 32 * CP + 10, 4, { background: 'var(--line)' });
    appear(base, tC3 + 0.1); errs.push(base);
    for (let i = 0; i < N; i++) {
      const e = DEC[i] - V[i], hh = Math.max(4, Math.abs(e) * ES);
      const bar = el(world, PX + i * CP + 8, e >= 0 ? EY - hh : EY, CS - 16, hh, { background: 'var(--paper)', borderRadius: '4px', transformOrigin: e >= 0 ? '50% 100%' : '50% 0%' });
      fromTo(bar, tC3 + 0.2 + i * Math.min(0.07, (Tend('c3') - tC3) / N), { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.3, ease: 'power3.out' });
      errs.push(bar);
    }
    const eUp = el(world, PX - 10, EY - 150, 600, 36, {}, '↑ 变大了', 'lbl-s'), eDn = el(world, PX - 10, EY + 116, 600, 36, {}, '↓ 变小了', 'lbl-s');
    appear(eUp, tC3 + 0.4); appear(eDn, tC3 + 0.4); errs.push(eUp, eDn);
    // 数轴上的点退淡，让偏差图做主角
    fromTo([axis, v16, ...ticks, ...dots], tC3, { opacity: 1 }, { opacity: 0.25, duration: 0.3, immediateRender: false });
    fromTo([axL, axR], tC3, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false });
    sfx('tick', tC3 + 0.2, { g: 0.5 }); sfx('tick', tC3 + 0.6, { g: 0.45 }); sfx('tick', tC3 + 1.0, { g: 0.4 });
    const avg = el(world, 900, EY + 116, 860, 40, { textAlign: 'right' }, '平均偏 0.00068 · 这些数本身平均 0.0083', 'lbl');
    appear(avg, T('c3', '偏了') - 0.1);

    // c3b → c6：落到说话上。数轴与那一行收到上方，两行词进来
    const tW = T('c3b') - 0.35;   // c3 说完先停一拍（gap 1.2 秒），再慢慢收起偏差图、两行词从左边铺进来
    fromTo([axis, v16, ...ticks, ...dots], tW, { opacity: 0.25 }, { opacity: 0, duration: 0.5, immediateRender: false });
    fromTo([...errs, avg, keep, ...codeCells, panel], tW, { opacity: 1 }, { opacity: 0, duration: 0.5, immediateRender: false });
    sfx('whoosh', tW, { g: 0.5 });
    const TX = 330, TP = 15, TW = 12, Y1 = 360, Y2 = 460, DIFF = [9, 28, 47, 66, 85];
    const lab1 = el(world, 120, Y1 - 2, 200, 50, {}, '原版', 'hit'), lab2 = el(world, 120, Y2 - 2, 200, 50, {}, '4 位的', 'hit');
    slide(lab1, tW + 0.2, { x: -30, d: 0.4 }); slide(lab2, tW + 0.3, { x: -30, d: 0.4 });
    const toks1 = [], toks2 = [];
    const tokCol = () => '#8A7BB5';   // 词用中性的灰紫（调色板里的 dimp），不用表示数大小的那套紫
    for (let i = 0; i < 100; i++) {
      const a = el(world, TX + i * TP, Y1, TW, 56, { background: tokCol(i) }, '', 'tok');
      const b = el(world, TX + i * TP, Y2, TW, 56, { background: tokCol(i) }, '', 'tok');
      fromTo([a, b], tW + 0.45 + i * 0.01, { autoAlpha: 0, scaleY: 0.2 }, { autoAlpha: 1, scaleY: 1, duration: 0.3 });
      toks1.push(a); toks2.push(b);
    }
    sfx('key', tW + 0.3, { g: 0.45 }); sfx('key', tW + 0.6, { g: 0.4 }); sfx('key', tW + 0.9, { g: 0.35 });
    const tokL = el(world, TX, Y2 + 84, 900, 40, {}, '每格一个词 · 示意', 'lbl-s');
    appear(tokL, tW + 1.0);
    // 不一样的词：4 位那一行的那一格变成白色、加高；原版那一格不动——上下一比就知道哪里不同
    const diffEls = DIFF.map((i) => {
      const e = el(world, TX + i * TP - 2, Y2 - 6, TW + 4, 68, { background: 'var(--paper)', borderRadius: '4px' });
      return [e];
    });
    const tFirst = T('c3b', '也可能变') - 0.1;
    diffEls[0].forEach((e) => appear(e, tFirst)); sfx('blip', tFirst, { g: 0.6 });
    // c4：一道竖线从左到右逐词比对两行，扫过一个不一样的词，它就亮，右上角的读数加一（第 1 个在 c3b 已经亮了）
    const tS0 = T('c3b', '也可能变') + 0.5, tS1 = T('c4', '五个') + 0.1, dS = tS1 - tS0, xAt = (x) => tS0 + dS * (x - TX) / (100 * TP);
    const sweep = el(world, TX - 3, Y1 - 16, 6, Y2 + 72 - Y1, { background: 'var(--paper)', borderRadius: '3px' });
    set(sweep, 0, { autoAlpha: 0 });
    fromTo(sweep, tS0, { x: 0, autoAlpha: 1 }, { x: 100 * TP, duration: dS, ease: 'none', immediateRender: false });
    set(sweep, tS1 + 0.02, { autoAlpha: 0 });
    const tC4 = tS1;
    const n5 = el(world, 1260, 150, 560, 110, { textAlign: 'right' }, '1 / 100', 'num');
    appear(n5, tS0);
    const n5K = keyed(n5);
    DIFF.slice(1).forEach((i, k) => { const t = xAt(TX + i * TP); diffEls[k + 1].forEach((e) => appear(e, t)); sfx('blip', t, { g: 0.5 }); n5K.at(t, { html: (k + 2) + ' / 100' }); });
    sfx('tick', tS0, { g: 0.4 });
    // 比对完：4 位那一行里和原版一样的 95 个词退暗，只剩 5 个白的；c5 时它们回来，换原版那一行退后
    const same2 = toks2.filter((_, i) => !DIFF.includes(i));
    fromTo(same2, tS1 + 0.05, { opacity: 1 }, { opacity: 0.3, duration: 0.08, immediateRender: false });
    fromTo(same2, T('c5') - 0.05, { opacity: 0.3 }, { opacity: 1, duration: 0.08, immediateRender: false });
    sfx('blip', tS1 + 0.05, { g: 0.5 });
    const n5L = el(world, 1060, 268, 760, 40, { textAlign: 'right' }, '与原版逐词一致 94.8%', 'lbl-s');
    appear(n5L, tC4 + 0.5);
    // c5：每个词接着前面的说：一个白色的游标沿 4 位那一行往右走，走过的词连成一条线
    const tC5 = T('c5') - 0.05, d5 = Tend('c5') - tC5 + 0.2;
    const chain = el(world, TX, Y2 + 64, 100 * TP, 5, { background: 'var(--paper)', borderRadius: '3px', transformOrigin: '0 50%' });
    fromTo(chain, tC5, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: d5, ease: 'none' });
    const head = el(world, TX - 9, Y2 + 57, 18, 18, { background: 'var(--paper)' }, '', 'dot');
    set(head, 0, { autoAlpha: 0 });
    fromTo(head, tC5, { x: 0, autoAlpha: 1 }, { x: 100 * TP, duration: d5, ease: 'none', immediateRender: false });
    exit(tokL, tC5, { d: 0.2 });
    sfx('riser', tC5, { g: 0.35 });
    fromTo([lab1, ...toks1], tC5, { opacity: 1 }, { opacity: 0.3, duration: 0.08, immediateRender: false });   // 原版那一行退后，跟着 4 位那一行走
    // c6：两条线从同一点出发。原版是直的；4 位的那条每遇到一个不一样的词就再拐一点，越拐越陡，越走越偏（示意，不标数）。
    // 累积误差要看得见：两条线之间的那块随笔头一起铺开（越往后越宽），每个拐点处画一根竖条量出此刻差了多远，竖条一根比一根长
    const tC6 = T('c6') - 0.1, d6 = Tend('c6') - tC6 + 0.6;
    const PY0 = 580, XE = TX + 100 * TP, sv = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world); px(sv, 0, 0);
    const xs = [TX, ...DIFF.map((i) => TX + i * TP + TW / 2), XE];
    let y = PY0, ang = 0;
    const pts = [[xs[0], y]];
    for (let k = 1; k < xs.length; k++) { y += Math.tan(ang) * (xs[k] - xs[k - 1]); pts.push([xs[k], y]); ang += 0.03 + k * 0.02; }
    const yAt = (x) => { for (let k = 1; k < pts.length; k++) if (x <= pts[k][0]) return lerp(pts[k - 1][1], pts[k][1], (x - pts[k - 1][0]) / (pts[k][0] - pts[k - 1][0])); return pts[pts.length - 1][1]; };
    const penX = (t) => TX + clamp((t - tC6) / d6) * 100 * TP, passT = (x) => tC6 + d6 * (x - TX) / (100 * TP);
    // 两条线之间的那块：多边形，用一个随笔头变宽的裁剪矩形铺开
    const defs = svg('defs', {}, sv), cp = svg('clipPath', { id: 'qz-wedge' }, defs), cr = svg('rect', { x: TX, y: 0, width: 0, height: 968 }, cp);
    svg('polygon', { points: pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + ` ${XE},${PY0} ${TX},${PY0}`, fill: '#5B21D6', opacity: 0.45, 'clip-path': 'url(#qz-wedge)' }, sv);
    const p0 = svg('path', { d: `M${TX},${PY0} L${XE},${PY0}`, fill: 'none', stroke: '#8A7BB5', 'stroke-width': 8, 'stroke-linecap': 'round' }, sv);
    const p1 = svg('path', { d: 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L'), fill: 'none', stroke: '#FFFFFF', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
    // 两条线的笔头：白点沿 4 位的线走，淡紫点沿原版的线走，横向同步
    const hd1 = el(world, 0, 0, 26, 26, { background: 'var(--paper)' }, '', 'dot'), hd0 = el(world, 0, 0, 22, 22, { background: 'var(--dimp)' }, '', 'dot');
    let lastH = null;
    F((t) => {
      const on = t >= tC6 && t < tTest - 0.1, x = penX(t), key = on ? x.toFixed(1) : 'off';
      if (key === lastH) return; lastH = key;
      hd1.style.display = hd0.style.display = on ? '' : 'none';
      cr.setAttribute('width', on ? (x - TX).toFixed(1) : '0');
      if (on) { px(hd1, x - 13, yAt(x) - 13); px(hd0, x - 11, PY0 - 11); }
    });
    set(sv, 0, { autoAlpha: 0 }); set(sv, tC6, { autoAlpha: 1 });   // 描线之前整层藏着：圆头线帽在未描的路径末端会留下一个点
    draw(p0, tC6, d6, { ease: 'none' }); draw(p1, tC6, d6, { ease: 'none' });
    // 每个拐点：一道细的竖虚线连到上面那个不一样的词；一个白点；一根竖条量出此刻两条线差了多远
    const guides = DIFF.map((i, k) => {
      const x = TX + i * TP + TW / 2, g = el(world, x - 1, Y2 + 76, 3, Math.max(4, PY0 - Y2 - 90), { background: 'repeating-linear-gradient(180deg,#CDBDFF 0 8px,transparent 8px 16px)' });
      appear(g, passT(x));
      return g;
    });
    const bends = pts.slice(1, -1).map((p) => { const d = el(world, p[0] - 9, p[1] - 9, 18, 18, { background: 'var(--paper)' }, '', 'dot'); appear(d, passT(p[0])); return d; });
    const gaps = pts.slice(2).map((p) => {
      const b = el(world, p[0] - 3, PY0, 6, p[1] - PY0, { background: 'var(--paper)', transformOrigin: '50% 0%' });
      fromTo(b, passT(p[0]), { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.25, ease: 'power2.out' });
      sfx('tick', passT(p[0]), { g: 0.45 });
      return b;
    });
    const e0 = el(world, XE - 200, PY0 - 52, 200, 44, { textAlign: 'right' }, '原版', 'lbl');
    const e1 = el(world, 1000, yAt(1300) + 22, 300, 44, { textAlign: 'right' }, '4 位的', 'lbl');
    const yEnd = pts[pts.length - 1][1];
    const acc = el(world, 1330, 802, 340, 44, {}, '差距越积越大 · 示意', 'lbl');   // 放在第 4、5 根竖条之间、线的下方，不压线也不压竖条
    appear(e0, tC6 + 0.4); appear(e1, passT(1300)); appear(acc, tC6 + d6 + 0.05);
    const st = el(world, TX - 18, PY0 - 18, 36, 36, { background: 'var(--paper)' }, '', 'dot');
    appear(st, tC6);
    sfx('riser', tC6, { g: 0.4 }); sfx('chime', tC6 + d6, { g: 0.5 });

    // 切到成绩之前收走
    fromTo([lab1, ...toks1], tTest - 0.45, { opacity: 0.3 }, { opacity: 0, duration: 0.35, immediateRender: false });
    const outAll = [lab2, ...toks2, ...diffEls.flat(), n5, n5L, chain, head, sv, ...guides, e0, e1, acc, st, hd0, hd1, sweep, ...bends, ...gaps];
    fromTo(outAll, tTest - 0.45, { opacity: 1 }, { opacity: 0, duration: 0.35, immediateRender: false });
    sfx('whoosh', tTest - 0.4, { g: 0.5 });
  });
})();
