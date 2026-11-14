// 开场：现象（同一个模型的两个文件）→ 片名卡。片名卡盖上来之后不再退回原画面，而是停住，直接过渡到下一场。
// 色带的画法与 src/design/keyframes.html 的第一张一致：原版是连续的紫，17 GB 的只剩 16 段；24 GB 的白线是显卡。
(function () {
  const { el, grad, bands } = QZ;
  scene('open', ({ root, s }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);

    // 第一个元素在 0.05 秒就出现：一条色带线从左刷到右
    const rule = el(world, 160, 120, 1600, 6, { background: grad(), transformOrigin: '0 50%' });
    wipe(rule, 0.05, { dir: 'l', d: 0.6 });

    // 名字：o1
    const name = el(world, 160, 168, 620, 60, { font: '600 44px/1 "Mono", "Sans SC"' }, 'Qwen3.8 27B');
    wipe(name, T('o1'), { dir: 'l', d: 0.5 }); sfx('thud', T('o1'), { g: 0.7 });
    const ai = el(world, 486, 184, 260, 44, {}, 'AI 模型', 'lbl');
    appear(ai, T('o1') + 1.0);

    // 原版：55 GB，连续的色带（o1b）。数字直接数上去，不先摆一个幽灵数
    const big55 = el(world, 156, 262, 320, 110, {}, '0 GB', 'big');
    wipe(big55, T('o1b'), { dir: 'l', d: 0.5 });
    countTo(big55, 0, 55, T('o1b'), 1.6, (v) => Math.round(v) + ' GB');
    const lab55 = el(world, 480, 330, 200, 44, {}, '原版', 'lbl');
    wipe(lab55, T('o1b'), { dir: 'l', d: 0.4 });
    // 色带就是模型文件这个对象，开场白念名字时它已在场（F25），不必等到 o1b
    const bar55 = el(world, 160, 396, 1320, 84, { background: grad() }, '', 'band-obj');
    wipe(bar55, T('o1') + 0.8, { dir: 'l', d: 0.7 }); sfx('whoosh', T('o1') + 0.8, { g: 0.5 });
    const two = el(world, 160, 500, 760, 56, {}, '同一个模型，两个文件', 'hit');
    appear(two, T('o1b') + 1.2);

    // 显卡 24 GB：白线（o2）。线右边的色带压暗，表示装不下
    const line = el(world, 735, 372, 3, 440, { background: '#FFFFFF' });
    wipe(line, T('o2') - 0.4, { dir: 't', d: 0.45 }); sfx('tick', T('o2') - 0.4, { g: 0.8 });
    const gpu = el(world, 585, 826, 320, 48, { textAlign: 'center', font: '600 32px/1 "Sans SC", "Inter"' }, '显卡 0 GB');
    wipe(gpu, T('o2') - 0.2, { dir: 'l', d: 0.4 });
    countTo(gpu, 0, 24, T('o2') + 0.2, 1.4, (v) => '显卡 ' + Math.round(v) + ' GB');
    const dim = el(world, 738, 396, 742, 84, { background: 'rgba(13,6,32,0.72)', borderRadius: '0 42px 42px 0' });
    appear(dim, T('o2') + 0.4);
    const under = el(world, 1010, 406, 220, 64, { lineHeight: '64px' }, '装不下', 'pill');
    appear(under, T('o2', '装'));
    const mine = el(world, 700, 736, 260, 44, { textAlign: 'center' }, '我的电脑', 'lbl');
    appear(mine, T('o2') + 0.9);

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
    const bar17 = el(world, 160, 686, 408, 84, { background: bands(16) }, '', 'band-obj');
    appear(bar17, T('o3') + 1.4); sfx('pop', T('o3') + 1.4, { g: 0.6, p: -0.3 });
    const s17 = el(world, 1260, 548, 500, 110, { textAlign: 'right' }, '90.4%', 'num');
    wipe(s17, T('o3') + 1.8, { dir: 'l', d: 0.4 });
    const gap = el(world, 980, 664, 500, 40, { textAlign: 'right' }, '相差 0.5 分 · 多对 1 题，正常波动', 'lbl-m');
    appear(gap, T('o3') + 2.2);

    // 片名卡（o4）：整屏亮紫从左盖上来；盖满后收起原画面且不再退回（修复「出现封面后又回到原来」），
    // 卡停住直到下一场把它接走。卡上的字在盖满之后才出现，避免与原画面文字叠在一起。
    const card = el(root, 0, 0, 1920, VH, {}, '', 'card');
    const tCard = T('o4'), tFull = tCard + 0.4;
    wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.8 });
    vanish(world, tFull);
    hudGround('L', tFull, s.end, 'ac'); hudGround('R', tFull, s.end, 'ac');
    const cardTop = el(card, 160, 200, 1200, 50, { font: '500 36px/1 "Mono", "Sans SC"', color: 'var(--ink)' }, '120 秒了解量化');
    appear(cardTop, tFull + 0.05);
    const cardBig = el(card, 160, 290, 1600, 130, { color: 'var(--ink)' }, '让模型变小的方式和代价', 'cap-big');
    slam(cardBig, tFull + 0.1, { from: 1.12, d: 0.35 }); sfx('thud', tFull + 0.1, { g: 0.8 });
    const note = el(card, 160, 470, 1600, 60, { color: 'var(--ink)' }, '量化：把每个数改用更少的位来存，换得体积变小', 'gloss');
    note.dataset.gloss = '量化';
    appear(note, Tend('o4', -0.4));
    // 带一样东西过去（F29）：卡底这条色带从连续变成 16 段，正是全片要讲的事；下一场从这条带接上
    const fbar = el(card, 160, 600, 1600, 72, { background: grad() }, '', 'band-obj');
    appear(fbar, tFull + 0.1);
    const gradCss = grad(), bandsCss = bands(16);
    let lastBg = null;
    F((t) => { const want = t >= tCard + 1.3 ? bandsCss : gradCss; if (want !== lastBg) { fbar.style.background = want; lastBg = want; } });
    const flab = el(card, 160, 692, 1600, 44, { color: 'var(--ink)' }, '55 GB 连续 → 17 GB 只剩 16 种紫', 'lbl');
    appear(flab, tCard + 1.3); sfx('tick', tCard + 1.3, { g: 0.6 });
  });
})();
