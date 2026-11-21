// 本片的引擎配置：字体、箭头颜色、章节卡、换场方式。
// 视觉系统：MongoDB 文档页（浅色主题）。白底、近黑字、森林绿衬线 H1、细线、浅灰代码块；亮绿 #00ED64 只给正在讲的那一样东西。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#001E2B', accent: '#00684A', dim: '#889397', spring: '#00ED64', red: '#DB3030', blue: '#016BF8', g1: '#00A35C' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Serif SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,   // 场间硬切，切点由整屏章节卡盖住
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    const chaps = L.scenes.filter((x) => x.chap);
    for (const s of chaps) {
      // 系列约定：整屏章节卡（章号、章名、本章要回答的问题），从一侧刷入、停留、收走；换场藏在它后面。
      // 样子是文档页：左栏是全片目录，当前章像文档左栏的选中项（浅绿底、绿竖条）；右边面包屑、衬线 H1、问题
      const idx = chaps.indexOf(s);
      const card = h('div', 'chapter', hud);
      const nav = h('div', 'nav', card);
      h('div', 'nk', nav, 'PART 6 · MONGODB');
      const Y0 = 160, DY = 68;
      const sel = h('div', 'sel', nav); css(sel, { top: Y0 + Math.max(0, idx - 1) * DY + 'px' });
      const items = MDB.CHAPS.map(([n, ti], k) => { const it = h('div', 'it' + (k < idx ? ' done' : ''), nav, `<span>${n}</span>${ti}`); css(it, { top: Y0 + k * DY + 'px' }); return it; });
      const main = h('div', 'main', card);
      h('div', 'crumb2', main, '文档<i>/</i>数据库引擎<i>/</i>MongoDB 的 WiredTiger');
      const no = h('div', 'no', main, `第 ${s.chap[0]} 章`);
      const ti = h('div', 'ti', main, s.chap[1]);
      const rule = h('div', 'rule', main);
      const q = h('div', 'q', main, s.chap[2] || '');
      const SECS = { nosql: ['2000 年代末', '10gen', '那场聚会', '两种读法', '四类'], whole: ['集合', 'mongod 与存储引擎', '三个文件'], insert: ['BSON', 'RecordId', '三棵树各一项', '事务'], flush: ['缓存', '检查点', 'B 树'], find: ['没有索引', '走姓名索引', '回集合树'], update: ['更新链', '检查点', '不覆盖写'], delete: ['删除标记', '检查点之后', 'Dave'], concur: ['事务', '副本集', '快照', '写冲突'], crash: ['日志', '写关注 j', '强制结束', '什么时候会丢'], five: ['放', '找', '改和删', '并发', '出错'], trade: ['换来了什么', '付出了什么', '更简单一点', '下一集'] };
      const onp = h('div', 'onp', main, `<div class="ok">在此页面上</div><div class="oi">${(SECS[s.id] || []).map((x) => `<span>${x}</span>`).join('')}</div>`);
      const cnt = h('div', 'ccnt', card, `${s.chap[0]} / ${String(chaps.length).padStart(2, '0')}`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      const odd = (+s.chap[0]) % 2 === 1;
      wipe(card, t0, { dir: odd ? 'l' : 'r', d: 0.45 });
      // 目录里的选中条从上一章滑到这一章；章名随之变绿
      if (idx === 0) fromTo(sel, t0 + 0.35, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' });
      else fromTo(sel, t0 + 0.5, { y: 0 }, { y: DY, duration: 0.7, ease: 'power3.inOut' });
      classAt(items[idx], 'now', t0 + 0.85);
      fromTo(no, t0 + 0.3, { x: odd ? -40 : 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
      fromTo(ti, t0 + 0.4, { x: odd ? -60 : 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out' });
      fromTo(rule, t0 + 0.4, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' });
      fromTo(q, t0 + 0.5, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
      fromTo(cnt, t0 + 1.6, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
      fromTo(onp, t0 + 1.9, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      [...onp.querySelectorAll('.oi span')].forEach((sp, k) => fromTo(sp, t0 + 2.0 + k * 0.22, { x: 24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }));
      wipeOut(card, t1, { dir: odd ? 'r' : 'l', d: 0.45 });
      sfx('whoosh', t0 - 0.05, { g: 0.7 }); sfx('thud', t0 + 0.4, { g: 0.45 });
    }
  },
};
