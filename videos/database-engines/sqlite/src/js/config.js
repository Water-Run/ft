// 本片的引擎配置：每一帧都像一页 sqlite.org 文档。常驻的页头（左上纯文字的引擎名与版本，右上两行斜体标语）与深青主菜单
// （章节即菜单项，当前章加下划线，最右写 PART 4，对应官网的 Search）；章节卡整屏（系列约定），深青底、亮蓝的编号块、常规字重的白字标题。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#000000', teal: '#044a64', blue: '#0482c4', dim: '#888888', red: '#aa3333', visited: '#734559', grey: '#aaaaaa' };
window.ENGINE = {
  fonts: [['400 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['400 20px "Inter"', 'Aa0'], ['600 20px "Inter"', 'Aa0'], ['italic 400 20px "Inter"', 'Aa0'], ['400 20px "Mono"', 'A0']],
  sceneFade: false,         // 硬切：每章开始后 sceneCut 秒切换，那一刻由章节卡盖住
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    // 页头与主菜单：全片常驻
    const head = h('div', 'abs doc-head', hud); px(head, 0, 0, 1920, 160);
    h('div', 'abs doc-brand', head, 'SQLite 3.54.1');
    h('div', 'abs doc-tag', head, 'Small. Fast. Reliable.<br>Choose any three.');
    const menu = h('div', 'abs doc-menu', head);
    const labels = ['自己写一个', '怎么放', '怎么找', '一页里', '回滚日志', 'WAL', '删', '五个问题'];
    const items = labels.map((s) => h('span', 'doc-item', menu, s));
    h('span', 'doc-item doc-right', menu, 'PART 4');
    const chaps = L.scenes.filter((s) => s.chap);
    chaps.forEach((s, i) => { const k = +s.chap[0] - 1; if (items[k]) classAt(items[k], 'now', s.start, i + 1 < chaps.length ? chaps[i + 1].start : (L.scenes.find((x) => x.id === 'end') || { start: L.total }).start); });
    // 章节卡：整屏深青，编号是亮蓝圆角块，标题白色常规字重，下面一行是本章要回答的问题（系列约定，只上画面）
    const Q = { '01': '为什么非要一个服务器？', '02': 'Alice 这一行，放在文件的哪里？', '03': '按名字找 Alice，要读哪几页？', '04': '一页 1024 个字节，怎样排开？', '05': '改到一半出了事，怎样回到原样？', '06': '读和写，能不能互不等待？', '07': '删掉的数据，空出来的页去了哪里？', '08': 'SQLite 的答案' };
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud, `<div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div>` + (Q[s.chap[0]] ? `<div class="q">${Q[s.chap[0]]}</div>` : ''));
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
      sfx('whoosh', t0 - 0.05, { g: 0.5 }); sfx('thud', t0 + 0.32, { g: 0.5 });
    }
  },
};
