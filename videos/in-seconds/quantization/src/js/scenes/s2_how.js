// 怎么变小：文件里的 32 个真实的数（b1）；数不能删，让每个数少占几位（b2）；4 位只有 16 种（b4）；
// 先定 16 个值，每个数换成最近的那个（b5）；文件里只记换成了第几个（b6）；这 32 个数只占原来的不到三成（b7）。
// 数都来自 data.js（第 1000 组，tensor blk.13.ffn_down.weight，刻度 d = 0.002775）。
(function () {
  const { el, ramp, grad, bands, xOf, bits16, bits4, valueOfCode, G } = QZ;
  scene('how', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);
    const BX = 144, BW = 1584, BY = 404, BH = 70, CY = 675;          // 色带的位置；16 个值的中线
    const X = (v) => xOf(v, BX, BW);
    const topEls = [], blockEls = [], dots = [];

    // b1：取自哪里，然后 32 个数落在色带上
    const src = el(world, 160, 178, 1500, 36, {}, `取自文件 · ${G.tensor} · 第 ${G.index} 组 · 32 个数`, 'lbl-m');
    wipe(src, T('b1'), { dir: 'l', d: 0.4 }); topEls.push(src);
    const band = el(world, BX, BY, BW, BH, { background: grad(), borderRadius: '35px', boxShadow: '0 0 48px #A855F7' });
    wipe(band, T('b1') + 0.1, { dir: 'l', d: 0.6 }); topEls.push(band);
    sfx('thud', T('b1'), { g: 0.6 });
    G.values.forEach((v, i) => {
      const cx = X(v), cy = 419 + (i % 3) * 20;
      const d = el(world, cx - 9, cy - 9, 18, 18, {}, '', 'dot');
      appear(d, T('b1') + 0.5 + i * 0.035);
      dots.push({ el: d, cx, cy, i, code: G.codes[i] });
      topEls.push(d);
    });

    // b2：色带从连续变成 16 段（同一条带，颜色断开）
    const gradCss = grad(), bandsCss = bands(16);
    let last = null;
    F((t) => { const want = t >= T('b2') + 0.2 ? bandsCss : gradCss; if (want !== last) { band.style.background = want; last = want; } });
    for (let k = 1; k < 16; k++) {                       // 色带被切成 16 段：同一条带，竖着切 15 刀
      const cut = el(world, BX + k * BW / 16 - 1.5, BY, 3, BH, { background: '#0D0620' });
      appear(cut, T('b2') + 0.2 + k * 0.02); topEls.push(cut);
    }
    sfx('tick', T('b2') + 0.2, { g: 0.6 }); sfx('blip', T('b4') + 0.2, { g: 0.5 });
    const seg = el(world, 1060, 326, 420, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 34px/60px "Sans SC", "Inter"' }, '16 段，每段一种颜色');
    appear(seg, T('b2') + 0.3); topEls.push(seg);
    const bitLine = el(world, 160, 520, 460, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 34px/60px "Sans SC", "Inter"' }, '每个数 16 位 → 4 位');
    appear(bitLine, T('b2') + 1.4); topEls.push(bitLine);
    const fourLab = el(world, 160, 330, 300, 56, {}, '4 位', 'hit');
    appear(fourLab, T('b4') + 0.1); topEls.push(fourLab);

    // b4：4 位只有 16 种。4 个格子亮起，计数到 16
    const four = [];
    for (let k = 0; k < 4; k++) {
      const c = el(world, 160 + k * 84, 236, 68, 68, { background: '#FFFFFF', borderRadius: '12px' });
      appear(c, T('b4') + 0.05); four.push(c); topEls.push(c);
    }
    const cnt = el(world, 560, 226, 200, 88, {}, '0', 'num');
    countTo(cnt, 0, 16, T('b4') + 0.3, 1.0, (v) => String(Math.round(v)));
    appear(cnt, T('b4') + 0.3); topEls.push(cnt);
    const cntLab = el(world, 730, 262, 200, 44, {}, '种', 'lbl');
    wipe(cntLab, T('b4') + 1.0, { dir: 'l', d: 0.3 }); topEls.push(cntLab);

    // b5：先定 16 个值（每个值一段颜色），每个数换成最近的那个
    for (let c = 0; c < 16; c++) {
      const cx = X(valueOfCode(c));
      const b = el(world, cx - 40, 640, 80, 70, { background: ramp(c / 15), borderRadius: '14px' });
      appear(b, T('b5')); blockEls.push({ el: b, cx, c });
      const n = el(world, cx - 40, 718, 80, 36, { textAlign: 'center' }, String(c), 'lbl-m');
      appear(n, T('b5')); blockEls.push({ el: n, cx, c: -1 });
    }
    sfx('tick', T('b5'), { g: 0.6 });
    const pillB5 = el(world, 160, 820, 560, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 34px/60px "Sans SC", "Inter"' }, '16 个值，各对应一种颜色');
    appear(pillB5, T('b5') + 1.3); topEls.push(pillB5);
    // 连线：每个数到它的格子，画出来（一次一条，先后错开）
    const svgEl = svg('svg', { class: 'ov', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world);
    dots.forEach((d, k) => {
      const tx = X(valueOfCode(d.code));
      const p = svg('path', { d: `M${d.cx},${d.cy} L${tx},${CY - 35}`, stroke: '#FFFFFF', 'stroke-width': 1.5, fill: 'none', opacity: 0.45 }, svgEl);
      draw(p, T('b5') + 0.3 + k * 0.012, 0.6);
    });
    // 数落到格子上（一次一个补间，起点与终点都显式给出）
    dots.forEach((d) => {
      const tx = X(valueOfCode(d.code));
      fromTo(d.el, T('b5') + 0.4 + d.i * 0.012, { left: d.cx - 9, top: d.cy - 9 }, { left: tx - 9, top: CY - 9, duration: 0.6, ease: 'power2.inOut' });
    });

    // b6：文件里只记换成了第几个。以第 3 个数（0.013428）为例：16 位 → 4 位，第 13 个
    const ex = G.values[2], exCode = G.codes[2];
    const exVal = el(world, 160, 232, 260, 68, { background: '#FFFFFF', color: '#0D0620', borderRadius: '34px', textAlign: 'center', lineHeight: '68px', font: '700 40px/68px "Sans SC", "Inter"' }, ex.toFixed(6));
    appear(exVal, T('b6'));
    const bits = bits16(ex), b4bits = bits4(exCode);
    const top16 = [];
    [...bits].forEach((b, i) => {
      const c = el(world, 470 + i * 48, 236, 42, 60, {}, '', 'cell ' + (b === '1' ? 'cell-on' : 'cell-off'));
      appear(c, T('b6') + i * 0.04); top16.push(c);
    });
    const lab16 = el(world, 470, 306, 300, 40, {}, '16 位', 'lbl');
    wipe(lab16, T('b6') + 0.8, { dir: 'l', d: 0.3 });
    const arrow = el(world, 1240, 226, 80, 60, { textAlign: 'center', font: '400 46px/1 "Inter"' }, '→', 'lbl');
    appear(arrow, T('b6') + 0.7);
    const four4 = [];
    [...b4bits].forEach((b, i) => {
      const c = el(world, 1330 + i * 48, 236, 42, 60, {}, '', 'cell ' + (b === '1' ? 'cell-on' : 'cell-off'));
      appear(c, T('b6') + 0.9 + i * 0.08); four4.push(c);
    });
    const lab4 = el(world, 1330, 306, 200, 40, {}, '4 位', 'lbl');
    wipe(lab4, T('b6') + 1.3, { dir: 'l', d: 0.3 });
    const idxTxt = el(world, 1545, 232, 260, 68, { background: '#FFFFFF', color: '#0D0620', borderRadius: '34px', textAlign: 'center', lineHeight: '68px', font: '700 40px/68px "Sans SC", "Inter"' }, `第 ${exCode} 个`);
    appear(idxTxt, T('b6') + 1.3);
    // 对应的那一格被圈出来，那个数的点变亮
    const ring = el(world, X(valueOfCode(exCode)) - 46, 630, 92, 90, { border: '3px solid #FFFFFF', borderRadius: '16px', boxShadow: '0 0 30px var(--paper)' });
    appear(ring, T('b6') + 1.5);
    classAt(dots[2].el, 'dot-hot', T('b6'));
    sfx('chime', T('b6') + 1.3, { g: 0.6 });
    // b6 之前的 4 位示例与数值让位给 16 位那一行（同一位置）
    hide(cnt, T('b6') - 0.1, { d: 0.3 }); hide(cntLab, T('b6') - 0.1, { d: 0.3 }); four.forEach((c) => hide(c, T('b6') - 0.1, { d: 0.3 }));

    // b7：512 位和 144 位，两条长度的对比
    const hideAll = [...topEls, ...blockEls.map((o) => o.el), svgEl, exVal, ...top16, arrow, ...four4, lab16, lab4, idxTxt, ring];
    hideAll.forEach((e) => hide(e, T('b7') - 0.1, { d: 0.4, y: 0 }));
    const n512 = el(world, 144, 292, 900, 96, {}, '512 位', 'num');
    appear(n512, T('b7') + 0.2);
    const s512 = el(world, 144, 396, 1200, 40, {}, '32 个数 × 16 位 · 原版', 'lbl-m');
    wipe(s512, T('b7') + 0.3, { dir: 'l', d: 0.4 });
    const bar512 = el(world, 144, 440, 1584, 96, { background: '#5B21D6', borderRadius: '48px' });
    wipe(bar512, T('b7') + 0.3, { dir: 'l', d: 0.8 });
    const n144 = el(world, 144, 580, 900, 96, {}, '144 位', 'num');
    appear(n144, T('b7') + 1.3);
    const s144 = el(world, 144, 684, 1200, 40, {}, '16 + 128 位 · 4 位', 'lbl-m');
    wipe(s144, T('b7') + 1.4, { dir: 'l', d: 0.4 });
    const bar144 = el(world, 144, 728, Math.round(1584 * 144 / 512), 96, { background: '#FFFFFF', borderRadius: '48px' });
    wipe(bar144, T('b7') + 1.4, { dir: 'l', d: 0.8 });
    const pct = el(world, 1100, 728, 628, 96, { textAlign: 'right' }, '28%', 'big');
    appear(pct, T('b7') + 2.2);
    sfx('whoosh', T('b7'), { g: 0.6 }); sfx('pop', T('b7') + 1.3, { g: 0.7 });
  });
})();
