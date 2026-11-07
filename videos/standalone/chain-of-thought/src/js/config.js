// 本片的引擎配置：要预载的字体、箭头可用的颜色、常驻元素（章节卡）、换场方式。
// 章节卡是安静的白卡：编号、一条细线、章名；整屏盖住硬切的那一刻（sceneCut），c0 前后收走。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1c1c1c', accent: '#a5402d', dim: '#707070' };
// 纸的纤维：固定种子的极淡噪声（.sheet::after 用）
document.documentElement.style.setProperty('--grain', `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4  0 0 0 0 0.4  0 0 0 0 0.4  0 0 0 0.14 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`)}")`);
window.ENGINE = {
  fonts: [['400 20px "Serif SC"', '字A0'], ['300 20px "Serif SC"', 'CoT'], ['500 20px "Serif SC"', '字A'], ['600 20px "Serif SC"', '字A'], ['500 20px "Sans SC"', '字A']],
  sceneFade: false,         // 硬切，那一刻由章节卡盖住
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud);
      const no = h('div', 'no', card, s.chap[0]);
      const rule = h('div', 'rule', card);
      const ti = h('div', 'ti', card, s.chap[1]);
      const t0 = s.start, t1 = s.start + s.lead - 0.4;
      show(card, t0, { d: 0.3, y: 0 });
      show(no, t0 + 0.25, { y: 10, d: 0.4 });
      fromTo(rule, t0 + 0.35, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' });
      show(ti, t0 + 0.45, { y: 14, d: 0.5 });
      hide(card, t1, { d: 0.35, y: 0 });
      sfx('tick', t0 + 0.35, { g: 0.5 });
    }
  },
};
