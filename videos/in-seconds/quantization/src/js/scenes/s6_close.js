// 收尾（z1–z4）：名字里的数字就是每个数占几位；开头那个 17 GB 的版本就是 4 位的，装得下 24 GB 的显卡。
// 画面回到开头的那块显卡：17 GB 的紫色色带在 24 GB 的白线之内；原版 55 GB 先是虚线轮廓，之后填上、压暗，写上「原版装不下」。
(function () {
  const { el, bands, grad } = QZ;
  scene('close', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);

    // z1：版本名做成白色的标签；现在说到的那一个变成紫色
    const names = [['BF16', 200, 250, '16 位'], ['Q8', 540, 190, '8 位'], ['Q4', 820, 190, '4 位'], ['NVFP4', 1100, 300, '4 位']];
    const tags = names.map(([txt, x, w], k) => {
      const tag = el(world, x, 430, w, 96, { background: '#FFFFFF', color: '#0D0620', borderRadius: '18px', textAlign: 'center', lineHeight: '96px', font: '700 52px/96px "Mono", "Sans SC"' }, txt);
      appear(tag, T('z1') + k * 0.6); sfx('pop', T('z1') + k * 0.6, { g: 0.6, p: (k - 1.5) * 0.3 });
      return tag;
    });
    const litAt = [T('z1') + 0.2, T('z1') + 1.6, T('z1') + 2.8, T('z1') + 4.0];
    const litIdx = (t) => { let k = -1; litAt.forEach((t0, i) => { if (t >= t0 - 1e-6) k = i; }); return k; };

    // z2：数字大致就是每个数占几位：标签依次换成位数，并变成紫色（每一个都是一次整块的变化）
    tags.forEach((tg, k) => {
      const t2 = T('z2') + k * 0.4;
      const txt = names[k][0], bits = names[k][3];
      let last = null;
      F((t) => {
        const flipped = t >= t2 - 1e-6;
        const active = !flipped && litIdx(t) === k;
        const want = flipped ? 'bits' : (active ? 'lit' : 'white');
        if (want === last) return;
        last = want;
        if (want === 'bits') { tg.textContent = bits; tg.style.background = '#5B21D6'; tg.style.color = '#FFFFFF'; }
        else if (want === 'lit') { tg.textContent = txt; tg.style.background = '#5B21D6'; tg.style.color = '#FFFFFF'; }
        else { tg.textContent = txt; tg.style.background = '#FFFFFF'; tg.style.color = '#0D0620'; }
      });
    });
    names.forEach((_, k) => sfx('blip', T('z2') + k * 0.4, { g: 0.4 }));

    // z3：开头那个 17 GB 的版本，就是 4 位的（色带 16 段）
    tags.forEach((e) => hide(e, T('z3') - 0.05, { d: 0.35, y: 0 }));
    const big17 = el(world, 160, 226, 600, 130, {}, '17 GB', 'big');
    appear(big17, T('z3') + 0.1);
    const bar17 = el(world, 160, 640, 408, 84, { background: bands(16), borderRadius: '42px', boxShadow: '0 0 48px #A855F7' });
    appear(bar17, T('z3') + 0.2); sfx('thud', T('z3') + 0.2, { g: 0.6 });
    const four = el(world, 160, 736, 300, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 36px/60px "Sans SC", "Inter"' }, '4 位 · 16 段');
    appear(four, T('z3') + 1.2);

    // z4：24 GB 的显卡，装得下了。原版 55 GB 先是虚线轮廓，之后填上（压暗）
    const orig = el(world, 160, 396, 1320, 84, { border: '3px dashed #CDBDFF', borderRadius: '42px' });
    appear(orig, T('z4'));
    const origLab = el(world, 160, 330, 500, 44, {}, '原版 55 GB', 'lbl');
    appear(origLab, T('z4'));
    const line = el(world, 735, 560, 3, 300, { background: '#FFFFFF', boxShadow: '0 0 18px #FFFFFF' });
    wipe(line, T('z4') + 0.1, { dir: 't', d: 0.5 }); sfx('tick', T('z4') + 0.1, { g: 0.8 });
    const gpu = el(world, 585, 868, 300, 48, { background: '#FFFFFF', color: '#0D0620', borderRadius: '24px', textAlign: 'center', lineHeight: '48px', font: '700 30px/48px "Sans SC", "Inter"' }, '显卡 24 GB');
    appear(gpu, T('z4') + 0.1);
    const fit = el(world, 960, 620, 380, 72, { background: '#A855F7', color: '#0D0620', borderRadius: '36px', textAlign: 'center', lineHeight: '72px', font: '700 44px/72px "Sans SC", "Inter"' }, '装得下了');
    appear(fit, T('z4') + 0.9);
    sfx('chime', T('z4') + 0.9, { g: 0.5 });
    const under = el(world, 960, 400, 340, 64, { background: '#FF6BB5', color: '#0D0620', borderRadius: '32px', textAlign: 'center', lineHeight: '64px', font: '700 38px/64px "Sans SC", "Inter"' }, '原版装不下');
    appear(under, T('z4') + 2.4); sfx('blip', T('z4') + 2.4, { g: 0.4 });
    const origFill = el(world, 160, 396, 1320, 84, { background: '#5B21D6', borderRadius: '42px', opacity: '0.75' });
    appear(origFill, T('z4') + 3.4); sfx('whoosh', T('z4') + 3.4, { g: 0.4 });
    const cmp = el(world, 960, 740, 340, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 34px/60px "Sans SC", "Inter"' }, '17 GB 小于 24 GB');
    appear(cmp, T('z4') + 5.2);
    // 24 − 17 = 7：还余多少（由上面两个数算出，不另外写数）
    const left7 = el(world, 960, 820, 340, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 34px/60px "Sans SC", "Inter"' }, `还余 ${24 - 17} GB`);
    appear(left7, T('z4') + 6.0);
  });
})();
