// 开场：现象（同一个模型的两个文件）→ 片名卡（在「叫量化」那句里出现，注解与术语同时到位）。
// 色带的画法与 src/design/keyframes.html 的第一张一致：原版是连续的紫，17 GB 的只剩 16 段；24 GB 的白线是显卡。
(function () {
  const { el, ramp, grad, bands, bits16 } = QZ;
  scene('open', ({ root, s }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);

    // 第一个元素在 0.05 秒就出现：一条色带线从左刷到右
    const rule = el(world, 160, 120, 1600, 6, { background: grad(), transformOrigin: '0 50%' });
    wipe(rule, 0.05, { dir: 'l', d: 0.6 });

    // 名字：o1
    const name = el(world, 160, 170, 620, 60, { font: '600 44px/1 "Mono", "Sans SC"' }, 'Qwen3.8 27B');
    wipe(name, T('o1'), { dir: 'l', d: 0.5 }); sfx('thud', T('o1'), { g: 0.7 });
    const ai = el(world, 486, 184, 260, 44, {}, 'AI 模型', 'lbl');
    wipe(ai, T('o1b'), { dir: 'l', d: 0.4 });

    // 原版：55 GB，连续的色带（o1b）
    const big55 = el(world, 156, 262, 320, 110, {}, '0 GB', 'big');
    wipe(big55, T('o1b'), { dir: 'l', d: 0.5 });
    countTo(big55, 0, 55, T('o1b'), 1.6, (v) => Math.round(v) + ' GB');
    const lab55 = el(world, 480, 330, 200, 44, {}, '原版', 'lbl');
    wipe(lab55, T('o1b'), { dir: 'l', d: 0.4 });
    const ph55 = el(world, 160, 396, 1320, 84, { border: '3px dashed #8A7BB5', borderRadius: '42px' });
    appear(ph55, T('o1') + 0.6);
    const pl55 = el(world, 156, 262, 320, 110, { opacity: '0.35' }, '55 GB', 'big');
    appear(pl55, T('o1') + 1.0); hide(pl55, T('o1b'), { d: 0.2, y: 0 });
    const bar55 = el(world, 160, 396, 1320, 84, { background: grad(), borderRadius: '42px', boxShadow: '0 0 48px #A855F7' });
    wipe(bar55, T('o1b') + 0.1, { dir: 'l', d: 0.7 }); sfx('whoosh', T('o1b'), { g: 0.5 });

    // 显卡 24 GB：白线（o2）。线右边的部分压暗，装不下（o2 里「装不下」）
    const line = el(world, 735, 372, 3, 440, { background: '#FFFFFF', boxShadow: '0 0 18px var(--paper)' });
    wipe(line, T('o2') - 0.4, { dir: 't', d: 0.45 }); sfx('tick', T('o2') - 0.4, { g: 0.8 });
    const gpu = el(world, 585, 826, 300, 44, { textAlign: 'center', font: '600 32px/1 "Sans SC", "Inter"' }, '显卡 0 GB');
    wipe(gpu, T('o2') - 0.2, { dir: 'l', d: 0.4 });
    countTo(gpu, 0, 24, T('o2') + 0.2, 1.4, (v) => '显卡 ' + Math.round(v) + ' GB');
    const dim = el(world, 736, 392, 744, 92, { background: '#0D0620', borderRadius: '0 46px 46px 0' });
    appear(dim, T('o2') + 0.4);
    const under = el(world, 1000, 406, 230, 64, { background: '#FFFFFF', color: '#0D0620', borderRadius: '32px', textAlign: 'center', lineHeight: '64px', font: '700 40px/64px "Sans SC", "Inter"' }, '装不下');
    appear(under, T('o2', '装'));
    const mine = el(world, 770, 736, 260, 60, { background: '#FFFFFF', color: '#0D0620', borderRadius: '30px', textAlign: 'center', lineHeight: '60px', font: '700 36px/60px "Sans SC", "Inter"' }, '我的电脑');
    appear(mine, T('o2') + 0.9);
    const two = el(world, 160, 500, 700, 56, {}, '下载页上的两个文件', 'hit');
    appear(two, T('o1b') + 1.2);

    // 同一份卷子（o3）：两个版本的分数
    const hdr = el(world, 1260, 222, 500, 44, { textAlign: 'right' }, '同一份卷子 · 答对', 'lbl');
    wipe(hdr, T('o3'), { dir: 'l', d: 0.4 });
    const s55 = el(world, 1260, 258, 500, 110, { textAlign: 'right' }, '89.9%', 'num');
    wipe(s55, T('o3'), { dir: 'l', d: 0.4 });

    // 17 GB：16 段的色带（o3）
    const big17 = el(world, 156, 552, 320, 110, {}, '0 GB', 'big');
    wipe(big17, T('o3'), { dir: 'l', d: 0.5 });
    countTo(big17, 0, 17, T('o3'), 1.2, (v) => Math.round(v) + ' GB');
    const lab17 = el(world, 480, 620, 300, 44, {}, '另一个版本', 'lbl');
    wipe(lab17, T('o3'), { dir: 'l', d: 0.4 });
    const ph17 = el(world, 160, 686, 408, 84, { border: '3px dashed #8A7BB5', borderRadius: '42px' });
    appear(ph17, T('o1') + 0.6);
    const pl17 = el(world, 156, 552, 320, 110, { opacity: '0.35' }, '17 GB', 'big');
    appear(pl17, T('o1') + 1.6); hide(pl17, T('o3'), { d: 0.2, y: 0 });
    const bar17 = el(world, 160, 686, 408, 84, { background: bands(16), borderRadius: '42px', boxShadow: '0 0 48px #A855F7' });
    appear(bar17, T('o3') + 0.2); sfx('pop', T('o3') + 0.2, { g: 0.6, p: -0.3 });
    const s17 = el(world, 1260, 548, 500, 110, { textAlign: 'right' }, '90.4%', 'num');
    wipe(s17, T('o3') + 0.6, { dir: 'l', d: 0.4 });
    const gap = el(world, 1080, 664, 400, 72, { background: '#FFFFFF', color: '#0D0620', borderRadius: '36px', textAlign: 'center', lineHeight: '72px', font: '700 40px/72px "Sans SC", "Inter"' }, '相差 0.5 分');
    appear(gap, T('o3') + 1.6);

    // 片名卡（o4）：全屏亮紫。注解「量化」在这句说完时已在画面上（data-gloss）
    const card = el(root, 0, 0, 1920, VH, {}, '', 'card');
    const tCard = T('o4'), tOut = Tend('o4') + 0.12;
    wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.8 });
    hudGround('L', tCard, tOut + 0.3, 'ac'); hudGround('R', tCard, tOut + 0.3, 'ac');
    const cardTop = el(card, 160, 230, 1200, 50, { font: '500 36px/1 "Mono", "Sans SC"' }, '120 秒了解量化');
    appear(cardTop, tCard + 0.1);
    const cardBig = el(card, 160, 330, 1600, 130, {}, '让模型变小的方式和代价', 'cap-big');
    slam(cardBig, tCard + 0.15, { from: 1.12, d: 0.35 }); sfx('thud', tCard + 0.15, { g: 0.8 });
    const note = el(card, 160, 560, 1600, 60, {}, '量化：把每个数改用更少的位来存，换得体积变小', 'gloss');
    note.dataset.gloss = '量化';
    appear(note, Tend('o4', -0.4));
    wipeOut(card, tOut, { dir: 'r', d: 0.4 }); sfx('whoosh', tOut, { g: 0.7 });
    // 片名卡在的时候，底下的画面收起来；卡收走之后，原来的画面再回来（同一个位置，不重算）
    set(world, tCard, { autoAlpha: 0 });
    set(world, tOut + 0.15, { autoAlpha: 1 });
  });
})();
