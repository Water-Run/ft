// 本片的引擎配置：字体、箭头颜色、常驻元素（章节卡、信息截止角标）、换场方式。
// 三套样式：开场、01、02、05 章用中性浅灰（ft 蓝作强调）；03 章 OpenAI 段白底黑字、方角；04 章 Anthropic 段米色暖底、陶土橙、衬线标题、圆角。
// 两家都只用文字名称，不放 logo；品牌字体是商业字体，用 Inter、思源黑体、思源宋体模仿气质。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#16181d', accent: '#1f5fd6', dim: '#8a8f98', red: '#b33a24', black: '#000000', clay: '#cc785c', slate: '#141413' };
const CHAP_STYLE = { git: 'n', jam: 'n', oai: 'o', ant: 'a', why: 'n' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['800 20px "Sans SC"', '字A'], ['500 20px "Serif SC"', '字A'], ['700 20px "Serif SC"', '字A'],
          ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const k = CHAP_STYLE[s.id] || 'n';
      const card = h('div', 'chapter ch-' + k, hud, `<div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div>`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.42;
      wipe(card, t0, { dir: 'l', d: 0.38 }); wipeOut(card, t1, { dir: 'r', d: 0.38 });
      fromTo(card.querySelector('.ti'), t0, { scale: 1 }, { scale: 1.02, duration: t1 - t0, ease: 'none' });   // 停留时整张卡极慢推近一次，不超过 3%
      sfx('whoosh', t0 - 0.05, { g: 0.45 }); sfx('thud', t0 + 0.3, { g: 0.45 });
    }
    // 系列约定：信息截止时间常驻右上角（片尾名单时收走）
    const cut = h('div', 'cutoff', hud, '信息截至 2026-11-03 · 北京时间');
    const cr = L.scenes.find((x) => x.id === 'credits');
    show(cut, 0.4, { y: -8, d: 0.4 });
    if (cr) hide(cut, cr.start + 0.2, { d: 0.3 });
  },
};
