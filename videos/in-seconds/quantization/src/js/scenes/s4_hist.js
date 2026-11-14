// 历史：2023 年，一个程序员想在 MacBook 上跑大模型，用 4 位压到了它（h1–h2）；
// 他在说明里写的原话：开头通顺，三四十个词以后明显变差（h3）。原文与译文都上画面（F11）。
// 引文里的 significanlty 是 2023 年 README 原文的拼写（FACTS C2/C3 照录），不改。
(function () {
  const { el, ramp, bands, grad } = QZ;
  scene('hist', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);

    // h1：年份与来处（llama.cpp 的第一个提交，2023-03-10）
    const year = el(world, 160, 196, 900, 130, {}, '2023 年 3 月', 'big');
    wipe(year, T('h1'), { dir: 'l', d: 0.5 }); sfx('thud', T('h1'), { g: 0.6 });
    const axis = el(world, 160, 340, 800, 14, { background: grad(), borderRadius: '7px' });
    wipe(axis, T('h1') + 1.5, { dir: 'l', d: 0.2 });
    const y0 = el(world, 160, 356, 200, 48, {}, '2023', 'hit');
    appear(y0, T('h1') + 1.5);
    const y1 = el(world, 620, 356, 340, 48, { textAlign: 'right' }, '2026 · 今天', 'hit');
    appear(y1, T('h1') + 2.3);
    const src = el(world, 160, 410, 1040, 44, {}, 'llama.cpp 的第一个提交 · Georgi Gerganov', 'lbl-m');
    appear(src, T('h1') + 1.8);
    // MacBook 收在右侧，与左边的引文留出间距，互不压
    const mac = el(world, 1280, 230, 500, 380, { border: '6px solid #FFFFFF', borderRadius: '24px' });
    appear(mac, T('h1') + 0.6);
    const macLab = el(world, 1280, 640, 500, 44, { textAlign: 'center' }, 'MacBook', 'lbl');
    appear(macLab, T('h1') + 0.6);

    // h2：他就是这样压到 4 位的：屏幕里是 16 段色带
    const screen = el(world, 1314, 264, 432, 312, { background: bands(16), borderRadius: '12px' });
    appear(screen, T('h2')); sfx('pop', T('h2'), { g: 0.7 });
    const four = el(world, 1280, 706, 500, 44, { textAlign: 'center' }, '4 位 · 16 段', 'lbl');
    wipe(four, T('h2') + 0.5, { dir: 'l', d: 0.4 });

    // h3：说明里的原话（英文原文），译文，以及「三四十个词」的样子：前 30 个实，之后渐渐变淡
    const quote = el(world, 160, 556, 1040, 56, {}, 'typically degrades significanlty after ~30-40 tokens', 'hit');
    appear(quote, T('h3'));
    const zh = el(world, 160, 620, 1040, 56, {}, '通常在约 30 到 40 个词元之后明显变差', 'cap-mid');
    wipe(zh, T('h3') + 0.5, { dir: 'l', d: 0.5 });
    const note = el(world, 160, 690, 1040, 40, {}, '词元：模型一次处理的一小段文字，大致相当于一个词', 'lbl');
    wipe(note, T('h3') + 1.0, { dir: 'l', d: 0.4 });
    for (let i = 0; i < 40; i++) {
      const alpha = i < 30 ? 1 : 1 - (i - 30) / 10 * 0.85;
      const c = el(world, 160 + i * 42, 790, 36, 36, { background: ramp(0.6), borderRadius: '8px', opacity: alpha });
      appear(c, T('h3') + 1.3);
    }
    const sq = el(world, 160 + 30 * 42, 736, 260, 48, { lineHeight: '48px', font: '700 28px/48px "Sans SC", "Inter"' }, '30 个之后', 'pill');
    appear(sq, T('h3') + 2.9);
    const srcLine = el(world, 160, 880, 1600, 36, {}, 'llama.cpp · README · 2023-03-10（原文，中文为译文）', 'src');
    wipe(srcLine, T('h3') + 0.9, { dir: 'l', d: 0.3 });
  });
})();
