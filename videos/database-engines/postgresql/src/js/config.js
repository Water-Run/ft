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
    // 主线：顶栏中间一排「文件」，第一次讲到时出现，讲到哪个文件哪个亮（WaterRun 看 r7：「各个概念缺乏连接, 协调和主线」）
    // 位置固定，后出现的文件不挤动前面的；亮暗由时间直接算出（不用 CSS 过渡）
    const FILES = [['heap', '堆', 'l6'], ['pk', '主键树', 'l14'], ['name', '姓名树', 'l12b'], ['age', '年龄树', 'l14'],
      ['vm', '可见性图', 'v2b'], ['fsm', '空闲空间图', 'd15'], ['xact', '提交状态', 'm4'], ['wal', 'WAL', 'w2']];
    const ACTIVE = [['l6', 'heap'], ['l12b', 'name'], ['l13e', 'name heap'], ['l14', 'pk name age'], ['l19', 'pk heap'], ['l20b', 'heap pk name age'], ['l21', ''], ['l24', 'heap pk name age'],
      ['p1', 'heap'], ['i1', 'heap'], ['i6', 'pk name age'], ['i7', 'pk'], ['i8', 'name'], ['i10', 'pk'],
      ['q1', ''], ['q4', 'name'], ['q6', 'heap'], ['q10', 'name heap'], ['q11', 'heap'], ['q13', ''], ['q15', 'heap'],
      ['u1', 'heap'], ['u12', 'pk name age'], ['u16', ''], ['u18', 'heap'], ['u25', 'heap age'], ['u27', 'heap'],
      ['m1', 'heap'], ['m4', 'xact'], ['m5', 'heap'], ['m8', 'heap xact'], ['m11', 'heap'], ['m17', 'xact'], ['m19', 'heap'],
      ['d1', 'heap'], ['d11', 'heap pk name age'], ['d12', 'heap'], ['d14', 'fsm'], ['d18', 'heap'], ['d20', ''], ['v1', 'vm'], ['v4', 'name vm'], ['d22', 'heap'], ['d30', 'heap xact'], ['d33', 'heap'],
      ['w1', 'wal'], ['w6', 'heap'], ['w8', 'heap wal'], ['w10', 'wal'], ['w12b', ''], ['w13', 'heap wal'], ['w20', 'heap xact'], ['w22', ''],
      ['z1', ''], ['z2', 'heap pk name age'], ['z4', 'name heap vm'], ['z6', 'heap fsm'], ['z8', 'xact heap'], ['z10', 'wal'], ['z12', 'heap'], ['t1', '']]
      .map(([id, ids]) => [L.cues[id].start - 0.12, new Set(ids.split(' ').filter(Boolean))]);
    const tOff = L.scenes.find((s) => s.id === 'credits').start;
    const strip = h('div', 'files', band);
    const chips = FILES.map(([id, name, intro], i) => {
      const c = h('div', 'file', strip, `<span class="d">${name}</span><span class="o">${name}</span>`);
      const tIn = L.cues[intro].start - 0.12;
      const flips = [];   // 这个文件亮暗变化的时刻
      let was = false;
      for (const [t, ids] of ACTIVE) { const on = ids.has(id); if (on !== was) { flips.push([t, on]); was = on; } }
      return { c, o: c.querySelector('.o'), d: c.querySelector('.d'), tIn, flips };
    });
    F((t) => {
      const off = clamp((t - tOff) / 0.4);
      for (const k of chips) {
        const a = clamp((t - k.tIn) / 0.4) * (1 - off);
        let v = 0;
        for (const [tf, on] of k.flips) { if (tf > t) break; const e = clamp((t - tf) / 0.3); v = on ? Math.max(v, e) : Math.min(v, 1 - e); }
        k.c.style.opacity = a; k.c.style.transform = `translateY(${(1 - clamp((t - k.tIn) / 0.4)) * 8}px)`;
        k.o.style.opacity = v; k.d.style.opacity = 1 - v;   // 亮的那层盖上来时，暗的那层同时退掉（两层字不同时可见）
      }
    });
    // 章节卡：整屏 Pg 蓝，从左刷入，停留，向右收走——与前两集一样整屏（WaterRun 看 r9 前：「每个幕的切换展示还是和前两期一样, 全屏的哈, 不是一个小块」）
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
  // 场与场之间交叉淡变 0.7 秒：有章节卡的地方切换藏在章节卡后面；开场到第一章、片尾之间也不硬切
  after() {
    const XF = 0.7;
    L.scenes.forEach((s, i) => {
      const root = document.getElementById('sc-' + s.id), nx = L.scenes[i + 1];
      const a = i === 0 ? -1 : s.start, b = nx ? nx.start : Infinity;
      F((t) => {
        const on = t >= a - 0.01 && t < b + XF;
        root.style.display = on ? '' : 'none';
        if (!on) return;
        const fin = i === 0 ? 1 : clamp((t - a) / XF), fout = nx ? 1 - clamp((t - b) / XF) : 1;
        root.style.opacity = Math.min(fin, fout).toFixed(3);
      });
    });
  },
};
