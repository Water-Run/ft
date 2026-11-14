// 收尾（z1–z4）：名字里的数字就是每个数占几位；开头那个 17 GB 的版本就是 4 位的，装得下 24 GB 的显卡。
// 画面回到开头的那块显卡——色带、白线、显卡标签都用开场时的位置（F29 带一样东西过去）。
// 粉色只留给 1 位档的分数（在 test 一场），这里的「原版装不下」用白底，不用粉。
(function () {
  const { el, bands, grad } = QZ;
  scene('close', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);

    // z1：版本名标签，念到哪个哪个亮起（词的时刻对齐指认）
    const names = [['BF16', 200, 220, '16 位'], ['Q8', 520, 160, '8 位'], ['Q4', 780, 160, '4 位'], ['NVFP4', 1040, 280, '4 位']];
    const litT = [T('z1', 'B F 十六'), T('z1', 'Q 八'), T('z1', 'Q 四'), T('z1', 'N V F P 四')];
    const tags = names.map(([txt, x, w], k) => {
      const tag = el(world, x, 200, w, 96, { lineHeight: '96px' }, txt, 'tag');
      appear(tag, litT[k] - 0.15); sfx('pop', litT[k] - 0.15, { g: 0.6, p: (k - 1.5) * 0.3 });
      return tag;
    });
    const litIdx = (t) => { let k = -1; litT.forEach((t0, i) => { if (t >= t0 - 1e-6) k = i; }); return k; };

    // z2：数字大致就是每个数占几位：标签依次换成位数（每一个都是一次整块变化）
    tags.forEach((tg, k) => {
      const t2 = T('z2') + k * 0.3, txt = names[k][0], bits = names[k][3];
      let last = null;
      F((t) => {
        const flipped = t >= t2 - 1e-6;
        const active = !flipped && litIdx(t) === k;
        const want = flipped ? 'bits' : (active ? 'lit' : 'white');
        if (want === last) return;
        last = want;
        if (want === 'bits') { tg.textContent = bits; tg.style.background = '#5B21D6'; tg.style.color = '#FFFFFF'; }
        else if (want === 'lit') { tg.textContent = txt; tg.style.background = '#A855F7'; tg.style.color = '#0D0620'; }  // 亮紫底配墨字，对比度过 4.5
        else { tg.textContent = txt; tg.style.background = '#FFFFFF'; tg.style.color = '#0D0620'; }
      });
      sfx('blip', t2, { g: 0.4 });
    });

    // z3：开头那个 17 GB 的版本，就是 4 位的（色带 16 段，回到开场的位置）
    tags.forEach((e) => hide(e, T('z3') - 0.05, { d: 0.35, y: 0 }));
    const big17 = el(world, 160, 226, 600, 130, {}, '17 GB', 'big');
    appear(big17, T('z3') + 0.1);
    const bar17 = el(world, 160, 686, 408, 84, { background: bands(16) }, '', 'band-obj');
    appear(bar17, T('z3') + 0.2); sfx('thud', T('z3') + 0.2, { g: 0.6 });
    const four = el(world, 160, 780, 400, 44, { lineHeight: '44px', background: '#A855F7', color: '#0D0620', borderRadius: '12px', font: '700 30px/44px "Sans SC", "Inter"', textAlign: 'center' }, '4 位 · 16 段');
    appear(four, T('z3') + 1.2);

    // z4：24 GB 的显卡，装得下了。原版 55 GB 先是虚线轮廓，之后填上压暗（位置与开场一致）
    const orig = el(world, 160, 396, 1320, 84, { background: grad(), opacity: 0.45, border: '3px dashed #CDBDFF' }, '', 'band-obj');
    appear(orig, T('z4'));
    const origLab = el(world, 160, 330, 500, 44, {}, '原版 55 GB', 'lbl');
    appear(origLab, T('z4'));
    const line = el(world, 735, 372, 3, 440, { background: '#FFFFFF' });
    line.dataset.name = '显卡界线';
    wipe(line, T('z4') + 0.1, { dir: 't', d: 0.5 }); sfx('tick', T('z4') + 0.1, { g: 0.8 });
    const gpu = el(world, 585, 826, 320, 48, { lineHeight: '48px', font: '700 30px/48px "Sans SC", "Inter"' }, '显卡 24 GB', 'pill');
    appear(gpu, T('z4') + 0.1);
    // 容量条：17 GB 往 24 GB 里装。大面积整块变化（低分辨率静止检查可见），也是「装得下」的直观表达
    const capBar = el(world, 160, 560, 1600, 36, { background: '#2A1466', borderRadius: '18px' });
    appear(capBar, T('z4'));
    const capFill = el(world, 160, 560, 0, 36, { background: '#A855F7', borderRadius: '18px' });
    fromTo(capFill, T('z4') + 0.9, { width: 0 }, { width: Math.round(1600 * 17 / 24), duration: 0.6, ease: 'power2.out', immediateRender: false });
    fromTo(capBar, T('z4') + 2.4, { backgroundColor: '#2A1466' }, { backgroundColor: '#3B0F9E', duration: 0.4, immediateRender: false });
    fromTo(capFill, T('z4') + 3.4, { backgroundColor: '#A855F7' }, { backgroundColor: '#E061F2', duration: 0.4, immediateRender: false });
    fromTo(capBar, T('z4') + 5.2, { backgroundColor: '#3B0F9E' }, { backgroundColor: '#5B21D6', duration: 0.4, immediateRender: false });
    fromTo(capFill, T('z4') + 6.0, { backgroundColor: '#E061F2' }, { backgroundColor: '#FFE3FF', duration: 0.4, immediateRender: false });
    const capLab = el(world, 160, 606, 600, 40, {}, '17 / 24 GB · 装得下', 'hit');
    appear(capLab, T('z4') + 5.2);
    const fit = el(world, 960, 620, 380, 72, { lineHeight: '72px', font: '700 44px/72px "Sans SC", "Inter"' }, '装得下了', 'pill-ac');
    appear(fit, T('z4') + 0.9); sfx('chime', T('z4') + 0.9, { g: 0.5 });
    const under = el(world, 1010, 406, 220, 64, { lineHeight: '64px' }, '原版装不下', 'pill');
    appear(under, T('z4') + 2.4); sfx('blip', T('z4') + 2.4, { g: 0.4 });
    const origFill = el(world, 738, 396, 742, 84, { background: 'rgba(13,6,32,0.72)', borderRadius: '0 42px 42px 0' });
    origFill.dataset.name = '原版压暗';
    appear(origFill, T('z4') + 3.4); sfx('whoosh', T('z4') + 3.4, { g: 0.4 });
    const cmp = el(world, 960, 740, 400, 44, {}, '17 GB 小于 24 GB', 'hit');
    appear(cmp, T('z4') + 5.2);
    const left7 = el(world, 960, 800, 400, 44, {}, `还余 ${24 - 17} GB`, 'hit');
    appear(left7, T('z4') + 6.0);
    fromTo(orig, T('z4') + 8.0, { opacity: 0.45 }, { opacity: 0.75, duration: 0.3, ease: 'power2.out', immediateRender: false });
    fromTo(orig, T('z4') + 9.6, { opacity: 0.75 }, { opacity: 0.45, duration: 0.4, ease: 'power2.inOut', immediateRender: false });
  });
})();
