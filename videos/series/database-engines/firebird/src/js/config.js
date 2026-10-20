// 本片的引擎配置：要预载的字体、箭头可用的颜色、常驻元素（章节卡）、换场方式。
// 配色与视觉系统见 src/css/style.css（Firebird 官网火鸟标志的火焰三色 + 官网墨色）。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#17222b', accent: '#EE2B24', dim: '#8a8378' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Heebo"', 'Aa0'], ['800 20px "Heebo"', 'Aa0'], ['500 20px "Mono"', 'A0']],
  sceneFade: false,         // 不做整屏淡入淡出。没有 after() 时，引擎在每章开始后 sceneCut 秒硬切，那一刻由章节卡盖住画面
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud, `<div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div>`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
      sfx('thud', t0 + 0.32, { g: 0.6 });
    }
  },
};
