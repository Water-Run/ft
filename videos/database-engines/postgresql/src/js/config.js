// 本片的引擎配置：预载的字体、常驻的顶栏与章节卡、换场方式（硬切，切换的那一刻由章节卡盖住）。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1f2a33', accent: '#336791', dim: '#699eca', warn: '#b8442f', grey: '#9aa4ad', navy: '#193145' };

// 每章的章节卡副题：这一章要回答的问题（画面文字，不进旁白）
const CHAPTER_Q = {
  history: '它从哪里来，凭什么叫正统',
  layout: '一个堆、三棵 B 树，行的地址叫 ctid',
  page: '8 KB 里的页头、指针与行',
  insert: '新行放在哪，三棵树怎样长',
  query: '按名字找到 Alice，要读几页',
  update: '改一行，为什么多出一行',
  mvcc: '两个版本，谁看见哪一个',
  delete: '旧版本什么时候收走',
  crash: '断电以后，提交过的还在吗',
  five: '放、找、改和删、并发、出错',
  tradeoff: '同一张表，两套答案',
};

window.ENGINE = {
  fonts: [['600 20px "Open Sans"', 'Aa0'], ['800 20px "Open Sans"', 'Aa0'], ['500 20px "Sans SC"', '字A'], ['800 20px "Sans SC"', '字A'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    // 顶栏：名字与版本，右边是当前章节
    const band = h('div', 'band', hud);
    h('div', 'ident', band, 'PostgreSQL<small>18</small>');
    const lab = h('div', 'chlabel', band, '');
    const k = keyed(lab);
    for (const s of L.scenes) {
      const text = s.id === 'open' ? '开场' : s.id === 'credits' ? '片尾' : `${s.chap[0]} · ${s.chap[1]}`;
      k.at(Math.max(0, s.start + 0.3), { html: esc(text) });
    }
    // 章节卡：整屏 Pg 蓝，从左刷入，停留，向右收走
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud,
        `<div class="no">${s.chap[0]}</div><div class="ti">${esc(s.chap[1])}</div>` +
        `<div class="q">${esc(CHAPTER_Q[s.id] || '')}</div><div class="ru"></div>`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
      sfx('whoosh', t0, { g: 0.45 }); sfx('thud', t0 + 0.36, { g: 0.55 });
    }
  },
};
