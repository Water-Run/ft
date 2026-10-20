// 本片的引擎配置。
// 配色与字体由 src/css/style.css 的变量给出（受托方可以在此基础上扩展）；
// 这里的常驻元素是「结构约定」：章节卡由 chrome() 生成，class 名与 style.css 对应。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#17222b', accent: '#EE2B24', dim: '#8a8378' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Heebo"', 'Aa0'], ['800 20px "Heebo"', 'Aa0'], ['500 20px "Mono"', 'A0']],
  sceneFade: false,         // 不做整屏淡入淡出。没有 after() 时，引擎在每章开始后 sceneCut 秒硬切，那一刻由章节卡盖住画面
  sceneCut: 0.45,
  chrome() {
    // 章节卡：整屏墨色，上面是编号与章名。外观由受托方在 style.css 的 .chapter 里定。
    const hud = document.getElementById('hud');
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud, `<div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div>`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
    }
  },
};
