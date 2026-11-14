// 历史：2023 年 llama.cpp 的第一个版本。目标是在 MacBook 上跑模型，办法是 4 位量化（FACTS C1、C2）。
// 一条原版的文件（连续的紫）飞进笔记本屏幕，落进去时变短、砖面只剩 16 种紫（示意：只表示「每个数变成 4 位、文件变小」，不标比例）。
// README 原话「一个晚上赶出来的，我不知道它对不对」：讲到「对不对」时，后半句的底色亮起来——全片接下来要回答的就是这一问。
// 中文释义就是这句旁白的字幕（F11），画面上只留原文，不再写一遍。
(function () {
  const { el, texURL, img } = QZ;
  scene('hist', ({ root, s }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);   // 镜头不动
    const tW = L.scenes.find((x) => x.id === 'what').start;

    const yr = el(world, 108, 128, 760, 240, { font: '200 236px/1 "Inter"', letterSpacing: '-10px' }, '2023');
    wipe(yr, s.start + 0.05, { dir: 'b', d: 0.55 }); sfx('thud', s.start + 0.1, { g: 0.7 });
    const d1 = el(world, 124, 384, 820, 50, {}, '3 月 10 日 · llama.cpp 的第一个版本', 'lbl');
    const d2 = el(world, 124, 436, 760, 44, {}, 'Georgi Gerganov', 'mlbl');
    slide(d1, s.start + 0.45, { x: -30, d: 0.45 }); slide(d2, s.start + 0.6, { x: -30, d: 0.45 });

    // 笔记本（通用造型，不画品牌标志），屏幕先空着，一个光标在闪
    const lp = QZ.laptop(world, 1000, 170, 700);
    slide(lp.root, T('h1', 'Mac') - 0.3, { x: 260, d: 0.6, ease: 'power3.out' }); sfx('whoosh', T('h1', 'Mac') - 0.35, { g: 0.5 });
    const mb = el(world, 1060, 664, 700, 44, { textAlign: 'center' }, 'MacBook', 'lbl');
    appear(mb, T('h1', 'Mac') + 0.2);
    const cur = el(lp.scr, 40, 40, 22, 40, { background: 'var(--dim)' });
    F((t) => { cur.style.opacity = t < T('h2') ? (Math.floor(t * 2) % 2 ? 0.2 : 1) : 0; });

    // 原版的模型文件：一条连续的紫（长度只表示「大」，不按 GB 画）
    const FW = 640, FH = 72, FX = 124, FY = 560;
    const big = el(world, FX, FY, FW, FH, { borderRadius: '8px', overflow: 'hidden' });
    img(big, texURL(7, 65536, 96, 8, 6, 2.4, 0.5)).style.cssText = 'display:block;width:100%;height:100%';
    big.dataset.name = '原版的模型文件';
    const bigL = el(world, FX, FY + FH + 14, 700, 40, {}, '原版的模型文件', 'lbl');
    const tIn = T('h1') + 0.6;
    wipe(big, tIn, { dir: 'l', d: 0.6 }); appear(bigL, tIn + 0.4); sfx('tick', tIn, { g: 0.5 });
    // h2：飞进屏幕，变短，砖面换成 16 种紫
    const SW = 200, sx = lp.sx + (lp.sw - SW) / 2, sy = lp.sy + 120;
    const small = el(world, sx, sy, SW, FH, { borderRadius: '8px', overflow: 'hidden', zIndex: 5 });
    img(small, texURL(7, 16, 96, 8, 6, 2.4, 0.5)).style.cssText = 'display:block;width:100%;height:100%';
    small.dataset.name = '量化后的模型文件';
    const tQ = T('h2', '量化') - 0.3;
    css(big, { transformOrigin: '0 0', zIndex: 5 });
    fromTo(big, tQ, { x: 0, y: 0, scaleX: 1 }, { x: sx - FX, y: sy - FY, scaleX: SW / FW, duration: 0.7, ease: 'power3.inOut', immediateRender: false });
    set(big, tQ + 0.7, { autoAlpha: 0 });
    set(small, 0, { autoAlpha: 0 }); set(small, tQ + 0.62, { autoAlpha: 1 });
    exit(bigL, tQ, { y: 10, d: 0.25 });
    sfx('whoosh', tQ, { g: 0.45 }); sfx('pop', tQ + 0.7, { g: 0.6 });
    const q4 = el(lp.scr, 0, 230, lp.sw, 44, { textAlign: 'center' }, '每个数 4 位 · 示意', 'mlbl');
    css(q4, { fontSize: '34px' });
    appear(q4, tQ + 0.85);

    // h3：README 原文。后半句「不知道它对不对」在讲到时亮起底色
    const tR = T('h3') - 0.1;
    const en1 = el(world, 124, 560, 860, 50, { fontSize: '34px' }, '“This was hacked in an evening -', 'quote');
    const plate = el(world, 112, 616, 836, 58, { background: '#5B21D6', borderRadius: '8px' });
    const en2 = el(world, 124, 620, 860, 50, { fontSize: '34px' }, 'I have no idea if it works correctly.”', 'quote');
    const src = el(world, 124, 700, 820, 40, {}, 'llama.cpp README · 2023-03-10', 'mlbl-s');
    wipe(en1, tR, { dir: 'l', d: 0.5 }); wipe(en2, tR + 0.3, { dir: 'l', d: 0.5 });
    sfx('key', tR, { g: 0.5 }); sfx('key', tR + 0.3, { g: 0.4 });
    appear(src, tR + 0.6);
    const tAsk = T('h3', '对不对') - 0.15;
    set(plate, 0, { autoAlpha: 0 }); set(plate, tAsk, { autoAlpha: 1 });
    css(en2, { zIndex: 2 });
    sfx('chime', tAsk, { g: 0.55 });
    let lastC = null;
    F((t) => { const c = t >= tAsk ? '#FFFFFF' : ''; if (c !== lastC) { en2.style.color = c; lastC = c; } });

    // 切到机制之前收走
    [yr, d1, d2, en1, en2, src].forEach((e, i) => wipeOut(e, tW - 0.5 + i * 0.03, { dir: 'l', d: 0.35 }));
    fromTo(plate, tW - 0.5, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false });
    exit(lp.root, tW - 0.5, { x: 200, d: 0.4 }); exit(mb, tW - 0.5, { x: 200, d: 0.4 });
    fromTo(small, tW - 0.5, { x: 0, opacity: 1 }, { x: 200, opacity: 0, duration: 0.4, ease: 'power2.in', immediateRender: false });
    sfx('whoosh', tW - 0.45, { g: 0.5 });
  });
})();
