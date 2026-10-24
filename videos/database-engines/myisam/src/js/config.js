// 本片的引擎配置：要预载的字体、箭头可用的颜色、常驻元素（顶栏与章节卡）、换场方式。视觉系统见 css/style.css。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#d9d9d9', orange: '#F29111', teal: '#3fb4cc', red: '#e5534b', dim: '#8a8a8a', faint: '#4a4a4a' };
// 顶栏上当前讲到的文件：章 → 文件（0 = .frm，1 = .MYD，2 = .MYI）
const FILE_OF = { s2: [0, 1, 2], s3: [1], s4: [1], s5: [1], s6: [2], s7: [2, 1], s9: [1, 2], s10: [0, 1, 2] };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Mono"', 'A0'], ['600 20px "Mono"', 'A0']],
  sceneFade: false,         // 硬切：每章开始后 sceneCut 秒换场，那一刻由章节卡盖住画面
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    // 顶栏：左边是这张表，右边是它的三个文件（第 02 章讲到时出现），当前讲到的文件标橙
    h('div', 'topband', hud);                                     // 顶栏是一条实心带，镜头推近时画面从它下面过去
    const bar = h('div', 'filebar', hud); bar.dataset.overlapOk = '';   // 顶栏是实心带：画面里的字从它下面过去，看起来不会重叠
    h('div', 'sess', bar, '<b>mysql&gt;</b> myisam_demo.users').dataset.overlapOk = '';
    const names = ['users.frm', 'users.MYD', 'users.MYI'];
    const tabs = names.map((n) => { const e = h('div', 'fl', bar, n); e.dataset.overlapOk = ''; return e; });
    const tIn = T('b2', '三个');
    tabs.forEach((e, i) => { appear(e, tIn + i * 0.12); sfx('tick', tIn + i * 0.12, { g: 0.4 }); });
    for (const s of L.scenes) for (const i of FILE_OF[s.id] || []) {
      // 第 02 章逐个讲到才点亮；其余各章整章点亮
      const t0 = s.id === 's2' ? [T('b3'), T('b5'), T('b6')][i] : s.start + s.lead;
      classAt(tabs[i], 'on', t0, s.end);
    }
    show(bar.children[0], 0.15, { y: 0, d: 0.5 });
    // 章节卡：像在终端里敲出一行注释，标题打出来，停住，向左收走
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud);
      h('div', 'no', card, `<b>--</b> ${s.chap[0]}`);
      const ti = h('div', 'ti', card);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      appear(card, t0);
      typeText(ti, esc(s.chap[1]), t0 + 0.15, 22, { sfxGain: 0.5 });
      wipeOut(card, t1, { dir: 'l', d: 0.42 });
      sfx('thud', t0 + 0.05, { g: 0.45 });
    }
  },
};
