// 本片的引擎配置：字体、箭头颜色、章节卡、换场方式。
// 视觉系统取第 2 轮选定的融合方向（src/design/keyframes2.html）：MongoDB 官网的浅色主题，暖白底、近黑字、森林绿衬线标题，
// 亮绿 #00ED64 只给正在讲的那一样东西；深色代码卡只在要看实物时出现。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#061621', accent: '#00684A', dim: '#889397', spring: '#00ED64', red: '#DB3030', blue: '#016BF8' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['700 20px "Serif SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,   // 场间硬切，切点由整屏章节卡盖住
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    for (const s of L.scenes) {
      if (!s.chap) continue;
      // 系列约定：整屏章节卡（章号、章名、本章要回答的问题），从一侧刷入、停留、收走；换场藏在它后面
      const card = h('div', 'chapter', hud,
        `<div class="col"><div class="no">${s.chap[0]}</div></div>` +
        `<div class="main"><div class="kick">PART 6 · MONGODB</div><div class="ti">${s.chap[1]}</div><div class="q">${s.chap[2] || ''}</div></div>`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      const odd = (+s.chap[0]) % 2 === 1;
      wipe(card, t0, { dir: odd ? 'l' : 'r', d: 0.45 });
      fromTo(card.querySelector('.main'), t0 + 0.2, { x: odd ? -40 : 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
      wipeOut(card, t1, { dir: odd ? 'r' : 'l', d: 0.45 });
      // 停留时大章号再落一次（章节卡不是一张静止的图）；问题随章名一起出来，留够读的时间
      slam(card.querySelector('.no'), t0 + 1.2, { from: 1.3 });
      // 进度：每章一格，当前章的格子慢慢点亮；章数在最后落下
      const chaps = L.scenes.filter((x) => x.chap), idx = chaps.indexOf(s);
      chaps.forEach((c2, k) => {
        const sq = h('div', 'csq' + (k < idx ? ' done' : ''), card, ''); css(sq, { left: 630 + k * 52 + 'px' });
        show(sq, t0 + 0.6 + k * 0.05, { y: 0, d: 0.3 });
        if (k === idx) to(sq, t0 + 1.1, { backgroundColor: '#00ED64', duration: 0.5 });
      });
      const cnt = h('div', 'ccnt', card, `${s.chap[0]} / ${String(chaps.length).padStart(2, '0')}`); slide(cnt, t0 + 2.3, { x: 30, d: 0.5 });
      sfx('whoosh', t0 - 0.05, { g: 0.7 }); sfx('thud', t0 + 0.3, { g: 0.5 });
    }
  },
};
