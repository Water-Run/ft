// 本片的引擎配置：要预载的字体、箭头可用的颜色、常驻元素（顶栏与章节卡）、换场方式。视觉系统见 css/style.css。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#d9d9d9', orange: '#F29111', teal: '#3fb4cc', red: '#e5534b', dim: '#8a8a8a', faint: '#4a4a4a' };
// 顶栏上当前讲到的文件：章 → 文件（0 = .frm，1 = .MYD，2 = .MYI）
const FILE_OF = { s2: [0, 1, 2], s3: [1], s4: [1], s5: [1], s6: [2], s7: [2, 1], s9: [1, 2], s10: [0, 1, 2] };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Mono"', 'A0'], ['600 20px "Mono"', 'A0']],
  sceneFade: false,         // 硬切：每章开始后 0.45 秒换场，换到的第一个画面就是本章的章节卡（见 after）
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
  },
  // 场景的显隐与章节卡。章节卡建在每章自己的场景里（不在常驻层）：扫描与预演看得见它的动作。
  // 换章像终端滚屏（WaterRun 2026-10-24：「每个章节切换有一些动画」）：上一章整屏往上滚走；章节卡那行注释从下面升上来，
  // 停住时极慢地推近；本章开始时它再往上滚走，本章的画面接着出现。
  after() {
    const CUT = 0.45;
    L.scenes.forEach((s, idx) => {
      const root = document.getElementById('sc-' + s.id), nx = L.scenes[idx + 1], pv = L.scenes[idx - 1];
      const a = idx === 0 ? -1 : s.start + CUT, b = nx ? nx.start + CUT : Infinity;
      F((t) => { root.style.display = (t >= a && t < b) ? '' : 'none'; });
      if (!s.chap) return;
      const t0 = s.start + CUT, t1 = s.start + s.lead - 0.45;
      // 上一章往上滚走（它在换场那一刻被隐藏，这一段补间只影响它最后的 0.55 秒）
      if (pv) { const pr = document.getElementById('sc-' + pv.id); fromTo(pr, t0 - 0.55, { y: 0 }, { y: -260, duration: 0.55, ease: 'power2.in' }); sfx('whoosh', t0 - 0.5, { g: 0.35 }); }
      const card = h('div', 'chapter', root);
      const inner = h('div', 'abs', card); css(inner, { left: 0, top: 0, right: 0, bottom: 0, padding: '330px var(--M) 0', transformOrigin: '120px 50%' });
      h('div', 'no', inner, `<b>--</b> ${s.chap[0]}`);
      const ti = h('div', 'ti', inner, esc(s.chap[1]) + '<span class="cur"></span>');
      // 光标闪烁：每 0.5 秒亮灭一次，由 t 算出（不用 CSS 动画）
      const cur = ti.querySelector('.cur');
      F((t) => { cur.style.opacity = Math.floor((t - t0) / 0.5) % 2 ? '0' : '1'; });
      appear(card, t0);
      fromTo(inner, t0, { y: 150, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' });
      fromTo(inner, t0, { scale: 1 }, { scale: 1.03, duration: t1 - t0, ease: 'none' });
      tl.to(inner, { y: -200, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t1);
      vanish(card, t1 + 0.4);
      sfx('thud', t0 + 0.1, { g: 0.45 });
    });
  },
};
